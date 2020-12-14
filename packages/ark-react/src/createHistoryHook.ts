import React from 'react';
import {
    isDefined,
    take
} from '@dateam/ark';
import createGlobalStateHook from './createGlobalStateHook';

/*
 ** ==============================================
 ** History State
 ** ==============================================
 */

type HistoryState<T> = {
    history: T[];
    pending: T | null;
    currentPosition: number;
};

type HistoryActions<T> = {
    push: (item: T) => void;
    setPending: (item: T) => void;
    replace: (item: T) => void;
    goTo: (item: T) => void;
};

type History<T> =
    & Pick<HistoryState<T>, 'history'>
    & HistoryActions<T>
    & {
        current: T | null;
        previous: T | null;
        next: T | null;
    };

const trimForwardHistory = <T>(history: T[], currentIndex: number) => {
    if (currentIndex < 0) return [];
    if (history.length === (currentIndex + 1)) return [...history];

    return take(history, currentIndex + 1);
};

const createHistoryHook = <T>(matchPredicate: (item: T, compareWith: T) => boolean): () => History<T> => {
    const { hook: useHistoryState } = createGlobalStateHook<HistoryState<T>>({
        history: [],
        pending: null,
        currentPosition: 0
    });

    return (): History<T> => {
        const [state, setState] = useHistoryState();

        return React.useMemo(() => {
            const { history, currentPosition, pending } = state;
            const positionOffset = pending ? 1 : 0;
            const position = currentPosition + positionOffset;

            return {
                history,
                current: pending ?? history[position] ?? null,
                previous: position > 0 ? (history[position - 1] ?? null) : null,
                next: (position + 1) < history.length ? (history[position + 1] ?? null) : null,
                push: (item: T) => {
                    if (!isDefined(item)) throw new TypeError('push history: item is not valid');

                    if (pending && !matchPredicate(pending, item)) {
                        console.warn('push history: new item doesn\'t match pending item');
                        return;
                    }

                    if (pending && history[currentPosition] === pending) {
                        return setState({
                            history,
                            currentPosition,
                            pending: null
                        });
                    }

                    let data: T[];

                    if (history.length === currentPosition + 1) {
                        data = [...history];
                    }
                    else {
                        data = trimForwardHistory(history, currentPosition);
                    }

                    data.push(item);

                    setState({
                        history: data,
                        currentPosition: data.length - 1,
                        pending: null
                    });
                },
                replace: (item: T) => {
                    if (!isDefined(item)) throw new TypeError('replace history: item is not valid');

                    const newPosition = currentPosition - (pending ? 0 : 1);
                    const newState: HistoryState<T> = {
                        history: trimForwardHistory(history, newPosition),
                        currentPosition: newPosition,
                        pending: item
                    };

                    setState(newState);
                },
                setPending: (item: T) => {
                    if (!isDefined(item)) throw new TypeError('setPending history: item is not valid');

                    const newState: HistoryState<T> = {
                        history,
                        currentPosition,
                        pending: item
                    };

                    setState(newState);
                },
                goTo: (item: T) => {
                    if (!isDefined(item)) throw new TypeError('goTo history: item is not valid');

                    const idx = history.findIndex(historyItem => historyItem === item);
                    if (idx === -1) throw new TypeError('goTo history: route not found');

                    const newState: HistoryState<T> = {
                        history,
                        currentPosition: idx,
                        pending: history[idx]
                    };

                    setState(newState);
                }
            };
        }, [state, setState]);
    };
};

export default createHistoryHook;