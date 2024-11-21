import {
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Coffee } from './entities/coffee.entity';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateCoffeeDto } from "./dto/create-coffee.dto";
import { UpdateCoffeeDto } from "./dto/update-coffee.dto";

@Injectable()
export class CoffeesService {
    constructor(
        @InjectRepository(Coffee)
        private readonly coffeeRepository: Repository<Coffee>,
    ) {}

    findAll() {
        return this.coffeeRepository.find();
    }

    async findOne(id: string) {
        const coffee = await this.coffeeRepository.findOne({where:{id: +id}})
        if (!coffee) {
            throw new NotFoundException(`coffee #${id} not found`);
        }
        return coffee;
    }

    create(createCoffeeDto: CreateCoffeeDto) {
        const coffee = this.coffeeRepository.create(createCoffeeDto);
        return this.coffeeRepository.save(coffee);
    }

    async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
        const coffee = await this.coffeeRepository.preload({
            id: +id,
            name: updateCoffeeDto.name,
            brand: updateCoffeeDto.brand,
            flavours: [...updateCoffeeDto.flavours]
        })

        if (!coffee) {
            throw new NotFoundException(`Coffe #${id} not found`)
        }
        return this.coffeeRepository.save(coffee)
    }

    async remove(id: string) {
        const coffee = await this.findOne(id);
        return this.coffeeRepository.remove(coffee)
    }
}
