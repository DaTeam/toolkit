import {
    formatDate as initialFormatDate,
    formatHour as initialFormatHour
} from './toolkit';

export const formatDate = (
    date: Date,
    timezone: Timezone,
    customFn = (year: string, month: string, day: string) => `${day}/${month}/${year}`
) => {
    const zonedDate = date.toTimezone(timezone);

    return initialFormatDate(zonedDate, customFn);
};

export const formatHour = (
    date: Date,
    timezone: Timezone,
    customFn = (hour: string, minute: string, second: string) => `${hour}:${minute}:${second}`
) => {
    const zonedDate = date.toTimezone(timezone);

    return initialFormatHour(zonedDate, customFn);
};

export type Timezone = 'Europe/Paris' | 'Europe/London';

type TimezoneInfo = {
    utc: number;
    dst: number;
    code: string;
};

const TIMEZONES: Record<Timezone, TimezoneInfo> = {
    'Europe/Paris': {
        utc: 60,
        dst: 120,
        code: 'FR'
    } as TimezoneInfo,
    'Europe/London': {
        utc: 0,
        dst: 60,
        code: 'GB'
    } as TimezoneInfo
};

declare global {
    interface Date {
        toTimezone(timezone: string): Date;
    }
}

const getStdTimezoneOffset = (date: Date): number => {
    const jan = new Date(date.getFullYear(), 0, 1);
    const jul = new Date(date.getFullYear(), 6, 1);

    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
};

const isDstObserved = (date: Date): boolean => {
    const currentTimezoneOffset = date.getTimezoneOffset();
    const stdTimezoneOffset = getStdTimezoneOffset(date);

    return currentTimezoneOffset < stdTimezoneOffset;
};

Date.prototype.toTimezone = Date.prototype.toTimezone ||
    function toTimezone(this: Date, timezone: Timezone): Date {
        if (!Object.keys(TIMEZONES).some(key => key === timezone)) {
            throw new Error(`Timezone ${timezone} not found`);
        }

        const timezoneInfo = TIMEZONES[timezone];
        const isDst = isDstObserved(this);
        const utcOffset = this.getTimezoneOffset();
        const offset = isDst ? timezoneInfo.dst : timezoneInfo.utc;

        if (Math.abs(utcOffset) === Math.abs(offset)) {
            return new Date(this.getTime());
        }

        // convert date to UTC
        const utc = this.getTime() + (utcOffset * 60000);

        // convert UTC to timezone
        const newDate = new Date(utc + (offset * 60000));

        return newDate;
    };
