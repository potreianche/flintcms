import React, { Component } from 'react';
import { Link } from 'react-router';
import { formatDate } from '../../utils/helpers';
import Page from '../../containers/Page';
import Table from '../../components/Table';
import Checkbox from '../../components/Checkbox';
import Dropdown from '../../components/Fields/Dropdown';
import TitleBar from '../../components/TitleBar';
import types from '../../utils/types';
import DeleteIcon from '../../components/DeleteIcon';
import { deleteUserGroup } from '../../actions/usergroupActions';

export default class UserGroups extends Component {
  static propTypes = {
    ...types.usergroups,
  }

  handleDropdownChange(_id) { // eslint-disable-line
    // TODO: Hook up to DB entry
    console.log(_id); // eslint-disable-line no-console
  }

  render() {
    const { usergroups, dispatch } = this.props;
    const usergroupNames = usergroups.usergroups.map(u => ({ label: u.title, value: u._id }));

    const reduced = usergroups.usergroups.map(props => ({
      key: props._id,
      title: {
        value: props.title,
        component: <Link to={`/admin/settings/usergroups/${props.slug}`}>{props.title}</Link>,
      },
      slug: props.slug,
      dateCreated: {
        value: new Date(props.dateCreated).getTime(),
        component: formatDate(props.dateCreated),
      },
      delete: {
        sortBy: false,
        component: <DeleteIcon
          dispatch={dispatch}
          onClick={() => dispatch(deleteUserGroup(props._id))}
          message="Are you sure you want to delete this user group?"
        />,
      },
    }));

    return (
      <Page name="usergroups">
        <TitleBar title="User Groups">
          <Link to="/admin/settings/usergroups/new" className="btn btn--small">New User Group</Link>
        </TitleBar>

        <div className="content">
          <div className="page__inner">
            <Dropdown
              label="Default User Group"
              instructions="The default user group new users will be assigned"
              name="defaultUserGroup"
              options={[{ label: 'Admin', value: 'admin' }, ...usergroupNames]}
              onChange={this.handleDropdownChange}
            />
            <Checkbox label="Allow Public Registration" name="publicSignUp" />
            {reduced.length > 0 ? <Table formElement data={reduced} /> : <h3>No user groups!</h3>}
          </div>
        </div>
      </Page>
    );
  }
}
