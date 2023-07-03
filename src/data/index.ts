export default {
  antd: {
    Button: {
      onClick: {
        type: 'event',
        config: {
          paramList: [{ name: 'e' }]
        }
      },
      title: {
        type: 'basic',
        config: {
          initialValue: '按钮'
        }
      }
    },
    Tab: {
      item: [{
        key: 1,
        label: '标签页1',
        children: []
      }, {
        key: 2,
        label: '标签2',
      }]
    },
    'Input.Search': {
      onSearch: {
        type: 'event',
        api: {
          paramList: [{ name: 'e' }]
        }
      }
    },
    Select: {
      onChange: {
        type: 'event',
        api: {
          paramList: [{ name: 'data' }, { name: 'option' }]
        }
      }
    },
    Table: {
      // TODO:
    }
  }
};
