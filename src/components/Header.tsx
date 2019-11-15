import * as React from "react";
import TableContext from '../context/tableContext';


export const Header: React.SFC = () => {
    const { a, getComponent } = React.useContext(TableContext)
    const TableComponent = getComponent(['table'], 'table')

    return (
        <div>
            <h1>{a}</h1>
            <TableComponent />
        </div>
    )
};
