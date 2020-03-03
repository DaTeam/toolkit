import {
    Children,
    isValidElement,
    ReactNode,
    ReactElement
} from 'react';
import { compareCollection, toJSON } from './toolkit';

export const matchChildren = (
    prevChildren: ReactNode | undefined,
    nextChildren: ReactNode | undefined,
    unicityFn?: (element: ReactElement) => any
) => {
    const previousMarkers = prevChildren ? childrenToReactElement(prevChildren) : [];
    const nextMarkers = nextChildren ? childrenToReactElement(nextChildren) : [];
    const prevMarkersKey = previousMarkers.map(child => child.key);
    const nextMarkersKey = nextMarkers.map(child => child.key);
    let diff = compareCollection(prevMarkersKey, nextMarkersKey);

    if (diff.length > 0) return false;

    const prevMarkersProps = previousMarkers.map(unicityFn ?? (child => toJSON(child.props)));
    const nextMarkersProps = nextMarkers.map(unicityFn ?? (child => toJSON(child.props)));
    diff = compareCollection(prevMarkersProps, nextMarkersProps);

    return diff.length === 0;
};

export const childrenToReactElement = (children: ReactNode | undefined): ReactElement[] =>
    Children
        .toArray(children)
        .filter(isValidElement);
