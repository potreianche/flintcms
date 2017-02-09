import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import FlintLogo from '../../components/FlintLogo';
import './Nav.scss';

const NavItem = props => <li className="nav__list-item"><Link to={props.to}>{props.children}</Link></li>;

NavItem.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.object.isRequired,
};

export default class Nav extends Component {
  render() {
    return (
      <nav className="nav">
        <FlintLogo />
        <ul className="nav__list">
          <NavItem to="/admin">Home</NavItem>
          <NavItem to="/admin/entries">Entries</NavItem>
          <NavItem to="/admin/newsection">New Section</NavItem>
        </ul>
      </nav>
    );
  }
}
