// Add sample usage

const nested = {
  a: {
    b: {
      c: {
        d1: "hello",
        d2: 42,
      },
    },
  },
};

const store = {
  selectedNodes: {
    data: [] as any[],
    byId: {
      date: new Date()
    } as {date:Date} | undefined,
    test: {},
    options: {
      sort: 'asc'
    }
  },
};

declare function flatten<T extends object>(nested: T): Flatten<T, Date>;
declare function selector<T extends object>(nested: T): TransformSelector<T>;

/*
 ** HERE IS WHERE THE MAGIC HAPPENS
 */
const flattened = flatten(store);
const selectors = {...selector(store)};

type FormatFlattenedKey<Key, Prop> = `${Extract<Key, string | number>}${Prop extends string ? Capitalize<Prop> : Extract<Prop, number>}`;

type Flatten<T extends object, ExcludeTypes extends any = never> =
        object extends T ?
            object :
            {
                [K in keyof T]-?: (
                    x: NonNullable<T[K]> extends infer V ?
                      V extends object ?
                          V extends readonly any[] ?
                            Pick<T, K> :
                              keyof V extends never ?
                                Pick<T, K> :
                                V extends ExcludeTypes ? Pick<T, K> :
                                Flatten<V, ExcludeTypes> extends infer FV ? ({[P in keyof FV as FormatFlattenedKey<K, P>]: FV[P] }) : never
                          : Pick<T, K>
                      : never
                ) => void
            } extends Record<keyof T, (y: infer O) => void> ?
            O extends infer U ?
                { [K in keyof O]: O[K] }
                : never
            : never
        ;

type TransformSelector<T extends object> = {
  [K in keyof Flatten<
      T,
      Date
  > as `get${Capitalize<K & string>}`]: (state: T) => Flatten<
      T,
      Date
  >[K];
};


// Final

// declare namespace Utils {
//     type FormatFlattenedKey<Key, Prop> = `${Extract<Key, string | number>}${Prop extends string ? Capitalize<Prop> : Extract<Prop, number>}`;

//     type Flatten<T extends object, ExcludeTypes extends any = never> =
//         object extends T ?
//             object
//             : {
//                 [K in keyof T]-?: (
//                     x: T[K] extends infer V ?
//                         V extends NonNullable<V> ?
//                             V extends object ?
//                                 V extends readonly any[] ?
//                                     Pick<T, K>
//                                     : keyof V extends never ?
//                                         Pick<T, K>
//                                         : V extends ExcludeTypes ?
//                                             Pick<T, K>
//                                             : Flatten<V, ExcludeTypes> extends infer FV ?
//                                                 ({[P in keyof FV as FormatFlattenedKey<K, P>]: FV[P] })
//                                                 : never
//                                 : Pick<T, K>
//                             : Pick<T, K>
//                         : never
//                 ) => void
//             } extends Record<keyof T, (y: infer O) => void> ?
//             O extends infer U ?
//                 { [K in keyof O]: O[K] }
//                 : never
//             : never
//         ;
// }
