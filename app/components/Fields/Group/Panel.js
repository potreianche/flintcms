import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import serialize from 'form-serialize';
import { openModal } from 'actions/uiActions';
import update from 'immutability-helper';
import Button from 'components/Button';
import { slugify } from 'utils/helpers';
import NewBlockModal from './NewBlockModal';
import mapStateToProps from '../../../main';
import FieldColumn from './FieldColumn';

const GroupTile = ({ onClick, label, isActive }) => (
  <button
    type="button"
    onClick={onClick}
    className={`group__col__tile ${isActive ? 'is-active' : ''}`}
  >
    {label}
  </button>
);

GroupTile.propTypes = {
  onClick: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
};

class Panel extends Component {
  static propTypes = {
    blocks: PropTypes.objectOf(PropTypes.shape({
      name: PropTypes.string,
      handle: PropTypes.string,
      fields: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        handle: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        instructions: PropTypes.string,
        required: PropTypes.bool,
        options: PropTypes.arrayOf(PropTypes.object),
      })),
    })),
    name: PropTypes.string.isRequired,
    dispatch: PropTypes.func,
  }

  static defaultProps = {
    blocks: {},
    dispatch: null,
  }

  constructor(props) {
    super(props);
    this.newBlockType = this.newBlockType.bind(this);
    this.addBlockType = this.addBlockType.bind(this);
    this.changeBlockType = this.changeBlockType.bind(this);
    this.changeField = this.changeField.bind(this);
    this.newField = this.newField.bind(this);
    this.saveField = this.saveField.bind(this);
    this.deleteField = this.deleteField.bind(this);
    this.fieldTitleChange = this.fieldTitleChange.bind(this);

    this.state = {
      blocks: props.blocks,
      currentBlock: null,
      currentField: 0,
    };
  }

  addBlockType(block) {
    this.setState({
      blocks: {
        ...this.state.blocks,
        [block.name]: block,
      },
      currentBlock: block.name,
    });
  }

  newBlockType() {
    this.props.dispatch(openModal(<NewBlockModal confirm={this.addBlockType} />));
  }

  changeBlockType(currentBlock) {
    this.setState({ currentBlock });
  }

  fieldTitleChange(title) {
    const { blocks, currentBlock, currentField } = this.state;
    this.setState({
      blocks: {
        ...blocks,
        [currentBlock]: {
          ...blocks[currentBlock],
          fields: [
            ...blocks[currentBlock].fields.slice(0, currentField),
            update(blocks[currentBlock].fields[currentField], {
              $merge: {
                label: title || 'Blank',
                handle: slugify(title) || 'blank',
              },
            }),
            ...blocks[currentBlock].fields.slice(currentField + 1),
          ],
        },
      },
      currentField,
    });
  }

  saveField() {
    return new Promise((resolve, reject) => {
      const { currentField, blocks, currentBlock } = this.state;
      const data = serialize(this.fieldColumn.form, { hash: true, empty: true });
      this.fieldColumn.form.reset();

      if (!data) reject();

      this.setState({
        blocks: {
          ...blocks,
          [currentBlock]: {
            ...blocks[currentBlock],
            fields: [
              ...blocks[currentBlock].fields.slice(0, currentField),
              update(blocks[currentBlock].fields[currentField], { $merge: { ...data, label: data.title || 'Blank' } }),
              ...blocks[currentBlock].fields.slice(currentField + 1),
            ],
          },
        },
      }, resolve);
    });
  }

  changeField(currentField = this.state.currentField) {
    return this.saveField().then(() => {
      this.setState({
        currentField,
      });
    });
  }

  newField() {
    const { blocks, currentBlock } = this.state;
    const field = {
      label: 'Blank',
      handle: `blank-${blocks[currentBlock].fields.length}`,
    };

    this.saveField()
      .then(() => {
        this.setState({
          blocks: {
            ...blocks,
            [currentBlock]: {
              ...blocks[currentBlock],
              fields: [
                ...blocks[currentBlock].fields,
                ...field,
              ],
            },
          },
        }, () => {
          this.setState({
            currentField: blocks[currentBlock].fields.length,
          });
        });
      });
  }

  deleteField() {
    const { blocks, currentBlock, currentField } = this.state;
    this.saveField().then(() => {
      this.setState({
        currentField: 0,
        blocks: {
          ...blocks,
          [currentBlock]: {
            ...blocks[currentBlock],
            fields: [
              ...blocks[currentBlock].fields.slice(0, currentField),
              ...blocks[currentBlock].fields.slice(currentField + 1),
            ],
          },
        },
      });
    });
  }

  render() {
    const { currentBlock, currentField, blocks } = this.state;
    const { name: fieldName } = this.props;
    const block = blocks[currentBlock];
    const field = block && block.fields.length > 0
      ? block.fields[currentField]
      : {};

    return (
      <div className="group__panel">
        <div className="group__col">
          <h3 className="group__col__title">Block Types</h3>
          <div className="group__col__inner">
            {Object.keys(blocks).length > 0 && Object.keys(blocks).map(blockKey =>
              <GroupTile
                key={blockKey}
                isActive={currentBlock === blockKey}
                onClick={() => this.changeBlockType(blockKey)}
                label={blockKey}
              />)}
            <Button small onClick={this.newBlockType}>New Block Type</Button>
          </div>
        </div>

        <div className="group__col">
          <h3 className="group__col__title">Fields</h3>
          <div className="group__col__inner">
            {currentBlock !== null &&
              <div>
                {block.fields.map((f, i) =>
                  <GroupTile
                    key={f.handle}
                    isActive={currentField === i}
                    onClick={() => this.changeField(i)}
                    label={f.label}
                  />)}
                <Button small onClick={this.newField}>New Field</Button>
              </div>
            }
          </div>
        </div>

        <div className="group__field-layout">
          <h3 className="group__col__title">Fields</h3>
          {
            currentBlock !== null
            && currentField !== null
            && (
              <FieldColumn
                key={currentField}
                ref={(r) => { this.fieldColumn = r; }}
                field={field}
                onTitleChange={this.fieldTitleChange}
                deleteField={this.deleteField}
                dispatch={this.props.dispatch}
                canDelete={block.fields.length > 1}
              />
            )
          }
        </div>

        <div>
          {Object.keys(blocks).map(b =>
            Object.keys(blocks[b].fields).map(fieldObj =>
              Object.keys(fieldObj).map((key, i) => {
                const fieldHandle = fieldObj.handle;
                const s = fieldObj[key];
                return (
                  <input
                    key={key}
                    type="text"
                    hidden
                    readOnly
                    name={`${fieldName}[${b}][fields][${i}][${fieldHandle}][${key}]`}
                    value={typeof s === 'string' ? s : JSON.stringify(s)}
                  />
                );
              }),
            ),
          )}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(Panel);
