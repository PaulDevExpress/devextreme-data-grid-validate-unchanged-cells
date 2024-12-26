import React, { useCallback, useEffect, useState } from 'react';
import Button from 'devextreme-react/button';
import './App.css';
import 'devextreme/dist/css/dx.material.blue.light.compact.css';
import DataGrid, {
  DataGridTypes, Column, Editing, PatternRule, RequiredRule, StringLengthRule, Toolbar, Item,
} from 'devextreme-react/data-grid';
import notify from 'devextreme/ui/notify';
import { customers } from './data';

const pattern = /^\(\d{3}\) \d{3}-\d{4}$/i;

function App(): JSX.Element {
  let grid = React.useRef<DataGrid>(null);
  const [clicked, setClicked] = useState<Boolean>(false);
  const [changes, setChanges] = useState<DataGridTypes.DataChange[]>([]);

  const validateVisibleRows = React.useCallback(() => {
    let dataGrid = grid?.current?.instance;
    const currentChanges = (dataGrid?.option('editing.changes') as DataGridTypes.DataChange[]).filter((c) => {
      return Object.keys(c.data).length > 0;
    });
    const fakeChanges = dataGrid
      ? dataGrid.getVisibleRows().map((row: DataGridTypes.Row): DataGridTypes.DataChange => ({ type: 'update', key: row.key, data: {} }))
      : [];
    // alternatively, you can use the DataGrid|option method to set a new changes array
    setChanges([...currentChanges, ...fakeChanges]);
    setClicked(true);
  }, [changes]);

  useEffect(() => {
    if (changes.length && clicked) {
      let dataGrid = grid?.current?.instance;
      dataGrid?.repaint();
      // @ts-expect-error - getController is a private method
      dataGrid?.getController('validating').validate(true).then((result: Boolean) => {
        const message = result ? 'Validation is passed' : 'Validation is failed';
        const type = result ? 'success' : 'error';
        notify(message, type);
      });
      setClicked(false);
    }
  }, [validateVisibleRows]);

  const onChangesChange = useCallback((changes: DataGridTypes.DataChange[]): void => {
    setChanges(changes);
  }, []);

  return (
    <div className="demo-container">
      <DataGrid
        ref={grid}
        id="grid-container"
        dataSource={customers}
        keyExpr="ID"
        showBorders={true}
      >
        <Editing
          onChangesChange={onChangesChange}
          changes={changes}
          mode="batch"
          allowUpdating={true}
        />
        <Column
          dataField="CompanyName"
        >
          <RequiredRule />
        </Column>
        <Column dataField="City">
          <StringLengthRule min={4} />
        </Column>
        <Column dataField="Phone">
          <RequiredRule />
          <PatternRule
            message="Your phone must have '(555) 555-5555 format!'"
            pattern={pattern}
          />
        </Column>
        <Column dataField="Fax"></Column>
        <Column dataField="State"></Column>
        <Toolbar>
          <Item>
            <Button
              text="Validate DataGrid"
              stylingMode="outlined"
              onClick={validateVisibleRows}
            />
          </Item>
          <Item name="saveButton" />
          <Item name="revertButton" />
        </Toolbar>
      </DataGrid>
    </div>
  );
}

export default App;
