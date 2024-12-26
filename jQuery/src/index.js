$(() => {
  $('#gridContainer').dxDataGrid({
    dataSource: customers,
    keyExpr: 'ID',
    editing: { mode: 'batch', allowUpdating: true },
    columns: [{
      dataField: 'CompanyName',
      validationRules: [{ type: 'required' }],
    }, {
      dataField: 'City',
      validationRules: [{
        type: 'stringLength',
        min: 4,
      }],
    }, {
      dataField: 'Phone',
      validationRules: [{ type: 'required' }, {
        type: 'pattern',
        message: 'Your phone must have "(555) 555-5555" format!',
        pattern: /^\(\d{3}\) \d{3}-\d{4}$/i,
      }],
    }, 'Fax', 'State'],
    toolbar: {
      items: [
        {
          name: 'validate',
          widget: 'dxButton',
          options: {
            text: 'Validate DataGrid',
            stylingMode: 'outlined',
            onClick() {
              validateVisibleRows();
            },
          },
        },
        'saveButton',
        'revertButton',
      ],
    },
    showBorders: true,
  });
});

function validateVisibleRows() {
  const grid = $('#gridContainer').dxDataGrid('instance');
  const currentChanges = grid.option('editing.changes').filter(c => {
    return Object.keys(c.data).length > 0;
  });
  const fakeChanges = grid.getVisibleRows().map((row) => ({ type: 'update', key: row.key, data: {} }));

  grid.option('editing.changes', [...currentChanges, ...fakeChanges]);
  grid.repaint();

  grid.getController('validating').validate(true).then((result) => {
    const message = result ? 'Validation is passed' : 'Validation is failed';
    const type = result ? 'success' : 'error';
    DevExpress.ui.notify({
      message,
      type,
      position: {
        offset: '0 50',
        at: 'bottom',
        of: '.demo-container',
      },
    });
  });
}
