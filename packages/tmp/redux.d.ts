/*
 ** /!\ DISCLOSER /!\
 ** The types below assume you use following reducer setup:
 ** -----------------
 ** const data = (state:Record<any, any>| null = null, action: Redux.AnyAction) => {
 **     switch (action.type) {
 **     default:
 **         return state;
 **     }
 ** };
 **
 ** const isLoading = (state:boolean = false, action: Redux.AnyAction) => {
 **     switch (action.type) {
 **     default:
 **         return state;
 **     }
 ** };
 **
 ** const state = {
 **     data,
 **     isLoading
 ** };
 **
 ** export default combineReducers(state);
 **
 **
 ** This handles each state as a reducer which is then combined to form the reducer that covers a feature/entity/page.
 ** The example above will be used to display the output types below
 */

declare namespace Utils {
    namespace Redux {
        namespace _ {
            type NativeReduxReducersMapObject = import('redux').ReducersMapObject;
            type NativeReduxReducers = import('redux').Reducer;
            type NativeReduxAction = import('redux').Action;
            type NativeReduxAnyAction = import('redux').AnyAction;
            type NativeReduxActionCreator<A> = import('redux').ActionCreator<A>;
            type NativeImmutableMap<K = any, V = any> = import('immutable').Map<K, V>;
            type NativeImmutableList<T = any> = import('immutable').List<T>;

            /*
             ** Extracting the type for the first parameter of a function
             */
            type FirstParameter<T extends (...args: any) => any> = Parameters<T>[0];

            type SelectorKeyFormat<Key extends string> = `get${Capitalize<Key>}`;
            type StateSelectorIgnoreTypes =
                | Date
                | Map<any, any>
                | _.NativeImmutableMap
                | _.NativeImmutableList
            ;
        }

        /*
         ** Since pretty much nothing is typed in term of redux actions/thunk
         ** Here is an encapsulated type providing a generic `Dispatch` type with default values as any
         ** for a dispatch using for example useDispatch from 'redux-thunk'
         */
        type ThunkDispatch<
            State = any,
            ExtraArguments = any,
            A extends _.NativeReduxAction = _.NativeReduxAnyAction
        > = import('redux-thunk').ThunkDispatch<State, ExtraArguments, A>;

        /*
         ** Since pretty much nothing is typed in term of redux actions/thunk
         ** Here is an encapsulated type providing a generic `Action` type with default values as any
         ** for a dispatch using for example useDispatch from 'redux-thunk'
         */
        type ThunkAction<
            ReturnValue = any,
            State = any,
            ExtraArguments = any,
            A extends _.NativeReduxAction = _.NativeReduxAnyAction
        > = import('redux-thunk').ThunkAction<
            ReturnValue,
            State,
            ExtraArguments,
            A
        >;

        /*
         ** `State` has been added for Redux reducers using TypeScript
         ** It provides a way to output the type for the state generated
         ** References to this can be found in the `dynamic-link-reducer`
         **
         ** To use `State`, we provide to it the type of `state` like the following:
         **
         ** type MyReducerState = State<typeof state>;
         **
         ** Which will output:
         **
         ** type MyReducerState = {
         **     data: Record<any, any> | null | undefined;
         **     hasChanged: boolean | undefined;
         ** }
         */
        type State<T extends _.NativeReduxReducersMapObject> = { [P in keyof T]: _.FirstParameter<T[P]> };

        /*
         ** Default selector type
         */
        type Selector<S, T> = (state: S) => T;

        /*
         ** Generate the complete type for expected selectors from the provided the State
         **
         ** To use `Selectors`, we provide to it the type of `state` like the following:
         **
         ** type MyReducerState = State<typeof state>;
         ** type MyReducerSelectors = Selectors<MyReducerState>;
         **
         ** Which will output:
         **
         ** type MyReducerSelectors = {
         **     getData: (state: MyReducerState) => Record<any, any> | null | undefined;
         **     getHasChanged: (state: MyReducerState) => boolean | undefined;
         ** }
         */
        type ReducerSelectors<T> = T extends object ? {
            [K in keyof Flatten<T, _.StateSelectorIgnoreTypes> as _.SelectorKeyFormat<K & string>]:
                (state: T) => Flatten<T, _.StateSelectorIgnoreTypes>[K];
        } : never;

        type ExtraSelectors<S> = {
            [key: _.SelectorKeyFormat<string>]: Selector<S, any>;
        };

        type Selectors<S> = ReducerSelectors<S> & ExtraSelectors<S>;

        /*
         ** Overloading `Selectors` type
         ** To which you provide only the `typeof` of state value
         ** and it will handle the extraction of the State type
         */
        type StateSelectors<T extends _.NativeReduxReducersMapObject> = Selectors<State<T>>;

        /*
         ** Extracts the type of the action creators to output the type of all possible actions and their payload
         ** For that, you provide the `typeof` of each action creator
         */
        type ActionType<ActionCreator extends _.NativeReduxActionCreator<ReturnType<ActionCreator>>> = // TODO: Ark: make sure this works
            ReturnType<ActionCreator> extends _.NativeReduxAnyAction
            ? ReturnType<ActionCreator>
            : never;

        type ExtractAction<AC extends ActionCreator> = ReturnType<AC>;

        type ActionCreator = (...args: any[]) => _.NativeReduxAnyAction;

        type MatchableAction<AC extends ActionCreator> = AC & {
            match(action: _.NativeReduxAnyAction): action is ReturnType<AC>;
        };
    }
}
