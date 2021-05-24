export const strRemoveDiacritics = (value: string) => {
    if (!value) return value; // TODO: Add isString

    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
};
