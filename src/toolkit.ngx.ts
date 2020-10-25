/*
 *ngFor="let c of arrayOfObjects | orderBy:'propertyAccessor'"
 *ngFor="let c of arrayOfObjects | orderBy:'propertyAccessor':false"
*/
import { Pipe, PipeTransform } from '@angular/core';
import { orderBy, isArray, isBoolean, isString } from './toolkit';

@Pipe({ name: 'orderBy' })
export default class OrderByPipe implements PipeTransform {
    transform<T extends any>(value: T[], propertyAccessor: string, ascending: boolean = true): T[] {
        if (!isArray(value) || !isString(propertyAccessor) || !isBoolean(ascending)) throw new TypeError('orderBy parameters are not valid');

        const newValue = [...value];

        orderBy(newValue, propertyAccessor, { ascending });
        return newValue;
    }
}
