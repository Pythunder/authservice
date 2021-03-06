import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import { USERS_RECEIVED, USERS_ERROR, USER_UPDATE, ROLES_RECEIVED, ROLES_ERROR, USERROLES_RECEIVED, USERROLES_ERROR, FORMFIELD_UPDATE } from '../actiontypes';
import UserSelect from './UserSelect';
import RoleList from './RoleList';
import { Header } from './bootstrap/Header';
import { Container } from './bootstrap/Container';
import { StyledLinkLeft } from './bootstrap/StyledLinkLeft';
import { ChevronLeft } from './bootstrap/ChevronLeft';
import { ChevronRight } from './bootstrap/ChevronRight';
import {FormRow } from './bootstrap/FormRow';
import {FormLabel } from './bootstrap/FormLabel';
import {FormField } from './bootstrap/FormField';

class UserRoles extends Component {
    componentDidMount() {
        this.props.onUsers();
        this.props.onRoles();
        this.props.onUserRoles();
    }

    render () {
        let {
            users,
            usersMap,
            user,
            userroles,
            roles,
            rolesNotOnUser,
            rolesNotOnUserMap,
            rolesOnUser,
            rolesOnUserMap,
            formfield,
            onUsersFieldChange,
            onRolesNotOnUserChange,
            onAddRole,
            onRolesOnUserChange,
            onRemoveRole,
            onFieldChange,
            onSaveUpdatedUser,
        } = this.props;
        let {
            rolesNotOnUserSelected,
            rolesNotOnUserSelectedNames,
            rolesOnUserSelected,
            rolesOnUserSelectedNames,
        } = formfield;

        return (
            <div>
                <StyledLinkLeft to="/authservice/useradmin/users">Up to user adminstration</StyledLinkLeft><br/>
                <Header>
                    <h1>Modify user to role mappings</h1>
                </Header>
                <form onSubmit={ e => { e.preventDefault(); }}>
                    <Container>
                        <FormRow>
                            <FormLabel htmlFor="users">Select user</FormLabel>
                            <FormField>
                                <UserSelect id="users" className="form-control" users={users} usersMap={usersMap} value={user.fullname} onUsersFieldChange={onUsersFieldChange} />
                            </FormField>
                        </FormRow>
                        <FormRow>
                            <div className="no-gutters col-sm-4">
                                <label htmlFor="username">Roles not on user</label>
                                <RoleList id="rolesnotonuser" className="form-control" roles={rolesNotOnUser} rolesMap={rolesNotOnUserMap} value={rolesNotOnUserSelectedNames} onRolesFieldChange={onRolesNotOnUserChange} />
                            </div>
                            <div className="no-gutters col-sm-4">
                                <button className="btn btn-primary form-control" onClick={() => onAddRole(user, rolesOnUser, rolesNotOnUserSelected)}>Add role &nbsp;<ChevronRight/></button>
                                <button className="btn btn-primary form-control" onClick={() => onRemoveRole(user, rolesOnUserSelected)}><ChevronLeft/>&nbsp; Remove role</button>
                            </div>
                            <div className="no-gutters col-sm-4">
                                <label htmlFor="email">Role on user</label>
                                <RoleList id="rolesnotonuser" className="form-control" roles={rolesOnUser} rolesMap={rolesOnUserMap} value={rolesOnUserSelectedNames} onRolesFieldChange={onRolesOnUserChange} />
                            </div>
                        </FormRow>
                    </Container>
                </form>
            </div>
        );
    }
}

function findRolesNotOnUser(user, roles, rolesOnUser) {
    const rolesOnUserRolenames = rolesOnUser.map(role => role.rolename);
    const rolesNotOnUser = roles.filter(role => !rolesOnUserRolenames.includes(role.rolename));
    return rolesNotOnUser;
}

const mapStateToProps = (state) => {
    const rolesOnUser = state.userroles[state.user.username] || [];
    const rolesOnUserMap = new Map(rolesOnUser.map(i => [i.rolename, i]));
    const rolesNotOnUser = findRolesNotOnUser(state.user, state.roles, rolesOnUser);
    const rolesNotOnUserMap = new Map(rolesNotOnUser.map(i => [i.rolename, i]));
    return {
        users: state.users,
        usersMap: new Map(state.users.map(i => [i.firstname + ' ' + i.lastname, i])),
        user: state.user,
        roles: state.roles,
        userroles: state.userroles,
        formfield: state.formfield || {},
        rolesNotOnUser,
        rolesNotOnUserMap,
        rolesOnUser,
        rolesOnUserMap,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onUsers: () => {
            axios
                .get('/authservice/useradmin/api/users')
                .then(result => dispatch(USERS_RECEIVED(result.data)))
                .catch(error => dispatch(USERS_ERROR(error)));
        },
        onRoles: () => {
            axios
                .get('/authservice/useradmin/api/roles')
                .then(result => dispatch(ROLES_RECEIVED(result.data)))
                .catch(error => dispatch(ROLES_ERROR(error)));
        },
        onUserRoles: () => {
            axios
                .get('/authservice/useradmin/api/users/roles')
                .then(result => dispatch(USERROLES_RECEIVED(result.data)))
                .catch(error => dispatch(USERROLES_ERROR(error)));
        },
        onUsersFieldChange: (selectedValue, usersMap) => {
            let user = usersMap.get(selectedValue);
            dispatch(USER_UPDATE(user));
        },
        onRolesNotOnUserChange: (rolesNotOnUserSelectedNames, roleMap) => {
            const rolesNotOnUserSelected = roleMap.get(rolesNotOnUserSelectedNames);
            const payload = { rolesNotOnUserSelected, rolesNotOnUserSelectedNames };
            dispatch(FORMFIELD_UPDATE(payload));
        },
        onAddRole: (user, rolesOnUser, rolesNotOnUserSelected) => {
            const roles = [ rolesNotOnUserSelected ];
            const userwithroles = { user, roles };
            axios
                .post('/authservice/useradmin/api/user/addroles', userwithroles)
                .then(result => dispatch(USERROLES_RECEIVED(result.data)))
                .catch(error => dispatch(USERROLES_ERROR(error)));
        },
        onRolesOnUserChange: (rolesOnUserSelectedNames, roleMap) => {
            const rolesOnUserSelected = roleMap.get(rolesOnUserSelectedNames);
            const payload = { rolesOnUserSelected, rolesOnUserSelectedNames };
            dispatch(FORMFIELD_UPDATE(payload));
        },
        onRemoveRole: (user, rolesOnUserSelected) => {
            const roles = [ rolesOnUserSelected ];
            const userwithroles = { user, roles };
            axios
                .post('/authservice/useradmin/api/user/removeroles', userwithroles)
                .then(result => dispatch(USERROLES_RECEIVED(result.data)))
                .catch(error => dispatch(USERROLES_ERROR(error)));
        },
    };
};

UserRoles = connect(mapStateToProps, mapDispatchToProps)(UserRoles);

export default UserRoles;
