import React from 'react';
import { Header } from './components/Header'
import Table from './components/Table'
import TableContext from './context/tableContext'
import { GetComponent, CustomizeComponent, TableComponents } from './interface'
import { getPathValue, mergeObject } from './utils/valueUtil'

let components: TableComponents = {
    table: Table
};



const App: React.FC = () => {

    const mergedComponents = React.useMemo(() => mergeObject<TableComponents>(components, {}), [
        components,
    ]);

    const getComponent = React.useCallback<GetComponent>(
        (path, defaultComponent) =>
            getPathValue<CustomizeComponent, TableComponents>(mergedComponents, path) || defaultComponent,
        [mergedComponents],
    );

    return (
        <TableContext.Provider value={{ a: 'ts-table', getComponent }}>
            <div className="App">
                <Header />
            </div>
        </TableContext.Provider>
    );
}

export default App;
