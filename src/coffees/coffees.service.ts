import {
    Inject,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { Coffee } from "./entities/coffee.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { CreateCoffeeDto } from "./dto/create-coffee.dto";
import { UpdateCoffeeDto } from "./dto/update-coffee.dto";
import { Flavor } from "./entities/flavor.entity";
import { PaginationQueryDto } from "../common/dto/pagination-query.dto";
import { Event } from "../events/entities/event.entity";
import {COFFEE_BRANDS} from "./coffees.constants";

@Injectable()
export class CoffeesService {
    constructor(
        @InjectRepository(Coffee)
        private readonly coffeeRepository: Repository<Coffee>,
        @InjectRepository(Flavor)
        private readonly flavourRepository: Repository<Flavor>,
        private readonly dataSource: DataSource,
        @Inject(COFFEE_BRANDS) coffeeBrands: string[],
    ) {
    }

    findAll(paginationQuery: PaginationQueryDto) {
        const {offset,limit} = paginationQuery
        return this.coffeeRepository.find({
            relations: {
                flavors: true,
            },
            skip: offset,
            take: limit
        });
    }

    async findOne(id: string) {
        const coffee = await this.coffeeRepository.findOne({ where: { id: +id }, relations: { flavors: true } });
        if (!coffee) {
            throw new NotFoundException(`coffee #${id} not found`);
        }
        return coffee;
    }

    async create(createCoffeeDto: CreateCoffeeDto) {
        const flavors = await Promise.all(
            createCoffeeDto.flavors.map(name => this.preloadFlavourByName(name)),
        );

        const coffee = this.coffeeRepository.create({
            ...createCoffeeDto,
            flavors
        });
        return this.coffeeRepository.save(coffee);
    }

    async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
        const flavors =
            updateCoffeeDto.flavors &&
            (await Promise.all(
                updateCoffeeDto.flavors.map(name => this.preloadFlavourByName(name))
            ))

        const coffeeData = {
            id: +id,
            ...updateCoffeeDto,
            flavors,
        }

        const coffee = await this.coffeeRepository.preload(coffeeData);

        if (!coffee) {
            throw new NotFoundException(`Coffee #${id} not found`);
        }
        return this.coffeeRepository.save(coffee);
    }

    async remove(id: string) {
        const coffee = await this.findOne(id);
        return this.coffeeRepository.remove(coffee);
    }

    async recommendCoffee(coffee: Coffee) {
        const queryRunner = this.dataSource.createQueryRunner();

        await  queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            coffee.recommendations++

            const recommendEvent = new Event();
            recommendEvent.name = "recommend_coffee"
            recommendEvent.type = "coffee"
            recommendEvent.payload = {coffeeId: coffee.id}

            await queryRunner.manager.save(coffee)
            await queryRunner.manager.save(recommendEvent)

            await queryRunner.commitTransaction();
        }catch (err) {
            await queryRunner.rollbackTransaction();
        }finally {
            await queryRunner.release();
        }
    }

    private async preloadFlavourByName(name: string): Promise<Flavor> {
        const existingFlavour = await this.flavourRepository.findOne({
            where: {name},
        });
        if (existingFlavour) {
            return existingFlavour
        }
        return this.flavourRepository.create({name})
    }
}
