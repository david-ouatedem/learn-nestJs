import {Module} from "@nestjs/common";
import {CoffeesController} from "./coffees.controller";
import {CoffeesService} from "./coffees.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Coffee} from "./entities/coffee.entity";
import {Flavor} from "./entities/flavor.entity";
import {Event} from "../events/entities/event.entity";
import {COFFEE_BRANDS} from "./coffees.constants";

class ConfigService {
}

class DevelopmentConfigService {
}

class ProductionConfigService {
}


@Module({
    imports: [TypeOrmModule.forFeature([Coffee, Flavor, Event])],
    controllers: [CoffeesController],
    providers: [
        CoffeesService,
        {
            provide: ConfigService,
            useClass: process.env.NODE_ENV === "production" ? ProductionConfigService : DevelopmentConfigService,
        },
        {
            provide: COFFEE_BRANDS,
            useFactory: () => ['buddy brew', 'nescafe'],
        },
    ],
    exports: [CoffeesService],
})
export class CoffeesModule {
}
