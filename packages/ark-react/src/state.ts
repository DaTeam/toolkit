export type StateValue<S extends any> = S | (() => S);
export type StateReturn<S extends any> = [S, React.Dispatch<React.SetStateAction<S>>];