declare namespace Utils {
    namespace Immutable {
        namespace _ {
            type NativeImmutableMap<K = any, V = any> = import('immutable').Map<K, V>;
            type NativeImmutableList<T = any> = import('immutable').List<T>;

            type DeepImmutableValue<T> =
                T extends object ? DeepImmutableMap<T> :
                T extends any[] ? ImmutableList<T> :
                T extends any ? T : any;
        }

        // Shallow typing of generic Immutable Map for typed data
        interface ImmutableList<T> extends _.NativeImmutableList<T> {
            toJS(): T[];
        }

        // Shallow typing of generic Immutable Map for typed data
        interface ImmutableMap<T> extends _.NativeImmutableMap<any, any> {
            get<K extends keyof T, U = undefined>(key: K, notSetValue?: U): T[K] | U;
            set<K extends keyof T>(key: K, value: T[K]): ImmutableMap<T>;
            toJS(): T;
        }

        // Deep immutable typing of generic Immutable Map for typed data
        // Assumes that everything inside the Map is also immutable.
        interface DeepImmutableMap<T> extends _.NativeImmutableMap<any, any> {
            get<K extends keyof T>(key: K, notSetValue?: T[K]): _.DeepImmutableValue<T[K]> | T[K];
            set<K extends keyof T>(key: K, value: _.DeepImmutableValue<T[K]>): DeepImmutableMap<T>;
            toJS(): T;
        }
    }
}
