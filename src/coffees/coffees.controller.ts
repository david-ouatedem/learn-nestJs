/* eslint-disable prettier/prettier */
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { CoffeesService } from './coffees.service';

@Controller('coffees')
export class CoffeesController {
    constructor(private readonly coffeeService: CoffeesService) {}

    @Get()
    findAll(@Query() paginationQuery) {
        // const { limit, offset } = paginationQuery;
        return this.coffeeService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.coffeeService.findOne(id);
    }

    @Post()
    create(@Body() body) {
        const lastItem = this.coffeeService.findAll();
        return this.coffeeService.create({
            id: lastItem[0].id++,
            name: body.name,
            brand: body.brand,
            flavours: body.flavours,
        });
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() body) {
        return this.coffeeService.update(id, body);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.coffeeService.remove(id);
    }
}
