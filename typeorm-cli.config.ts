import { DataSource } from "typeorm";
import { CoffeeRefactor1732349403788 } from "./src/migrations/1732349403788-CoffeeRefactor";
import { Coffee } from "./src/coffees/entities/coffee.entity";
import { Flavor } from "./src/coffees/entities/flavor.entity";
import { SchemaSync1732350223840 } from "./src/migrations/1732350223840-SchemaSync";
import { SchemaSync1732350386045 } from "./src/migrations/1732350386045-SchemaSync";


export default new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "pass123",
    database: "postgres",
    entities: [Coffee,Flavor],
    migrations: [CoffeeRefactor1732349403788, SchemaSync1732350223840,SchemaSync1732350386045]
});