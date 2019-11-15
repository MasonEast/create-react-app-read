import { DataIndex } from '../interface';

const INTERNAL_KEY_PREFIX = 'RC_TABLE_KEY';

function toArray<T>(arr: T | T[]): T[] {
    if (arr === undefined || arr === null) {
        return [];
    }

    return Array.isArray(arr) ? arr : [arr];
}

export function getPathValue<ValueType, ObjectType extends object>(
    record: ObjectType,
    path: DataIndex,
): ValueType {
    // Skip if path is empty
    if (!path && typeof path !== 'number') {
        return (record as unknown) as ValueType;
    }

    const pathList = toArray(path);

    let current: ValueType | ObjectType = record;

    for (let i = 0; i < pathList.length; i += 1) {
        if (!current) {
            return null;
        }

        const prop = pathList[i];
        current = current[prop];
    }

    return current as ValueType;
}


export function mergeObject<ReturnObject extends object>(
    ...objects: Partial<ReturnObject>[]
): ReturnObject {
    const merged: Partial<ReturnObject> = {};

    /* eslint-disable no-param-reassign */
    function fillProps(obj: object, clone: object) {
        if (clone) {
            Object.keys(clone).forEach(key => {
                const value = clone[key];
                if (value && typeof value === 'object') {
                    obj[key] = obj[key] || {};
                    fillProps(obj[key], value);
                } else {
                    obj[key] = value;
                }
            });
        }
    }
    /* eslint-enable */

    objects.forEach(clone => {
        fillProps(merged, clone);
    });

    return merged as ReturnObject;
}