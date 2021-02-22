import { conditionalConcat, ConditionalParams, undef } from '@dateam/ark';

const concatClassName = (...args: ConditionalParams[]): string | undefined => conditionalConcat(...args) || undef;

export default concatClassName;