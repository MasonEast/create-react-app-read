type Component<P> =
    | React.ComponentType<P>
    | React.ForwardRefExoticComponent<P>
    | React.FC<P>
    | keyof React.ReactHTML;


export type CustomizeComponent<
    P extends React.HTMLAttributes<HTMLElement> = React.HTMLAttributes<HTMLElement>
    > = Component<P>;

export type GetComponent = (
    path: string[],
    defaultComponent?: CustomizeComponent,
) => CustomizeComponent;

export interface TableComponents {
    table?: CustomizeComponent;
    header?: {
        wrapper?: CustomizeComponent;
        row?: CustomizeComponent;
        cell?: CustomizeComponent;
    };
    body?: {
        wrapper?: CustomizeComponent;
        row?: CustomizeComponent;
        cell?: CustomizeComponent;
    };
}

export type DefaultRecordType = Record<string, any>;

export type DataIndex = string | number | (string | number)[];