import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import { ROLES_RECEIVED, ROLES_ERROR, ROLE_UPDATE } from '../actiontypes';
import RoleSelect from './RoleSelect';
import { emptyRole } from '../constants';
import { Header } from './bootstrap/Header';
import { Container } from './bootstrap/Container';
import { StyledLinkLeft } from './bootstrap/StyledLinkLeft';
import {FormRow } from './bootstrap/FormRow';
import {FormLabel } from './bootstrap/FormLabel';
import {FormField } from './bootstrap/FormField';

class RoleModify extends Component {
    componentDidMount() {
        this.props.onRoles();
    }

    render () {
        let {
            roles,
            rolesMap,
            role,
            onRolesFieldChange,
            onFieldChange,
            onSaveUpdatedRole,
        } = this.props;

        return (
            <div>
                <StyledLinkLeft to="/authservice/useradmin/roles">Up to role adminstration</StyledLinkLeft>
                <Header>
                    <h1>Modify role information</h1>
                </Header>
                <form onSubmit={ e => { e.preventDefault(); }}>
                    <Container>
                        <FormRow>
                            <FormLabel htmlFor="roles">Select role</FormLabel>
                            <FormField>
                                <RoleSelect id="roles" className="form-control" roles={roles} rolesMap={rolesMap} value={role.rolename} onRolesFieldChange={onRolesFieldChange} />
                            </FormField>
                        </FormRow>
                        <FormRow>
                            <FormLabel htmlFor="rolename">Role name</FormLabel>
                            <FormField>
                                <input id="rolename" className="form-control" type="text" value={role.rolename} onChange={(event) => onFieldChange({rolename: event.target.value}, role)} />
                            </FormField>
                        </FormRow>
                        <FormRow>
                            <FormLabel htmlFor="email">Role description</FormLabel>
                            <FormField>
                                <input id="description" className="form-control" type="text" value={role.description} onChange={(event) => onFieldChange({description: event.target.value}, role)} />
                            </FormField>
                        </FormRow>
                        <FormRow>
                            <button className="btn btn-primary form-control" onClick={() => onSaveUpdatedRole(role)}>Save changes to role</button>
                        </FormRow>
                    </Container>
                </form>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        roles: state.roles,
        rolesMap: new Map(state.roles.map(i => [i.rolename, i])),
        role: state.role,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onRoles: () => {
            axios
                .get('/authservice/useradmin/api/roles')
                .then(result => dispatch(ROLES_RECEIVED(result.data)))
                .catch(error => dispatch(ROLES_ERROR(error)));
        },
        onRolesFieldChange: (selectedValue, rolesMap) => {
            let role = rolesMap.get(selectedValue);
            dispatch(ROLE_UPDATE(role));
        },
        onFieldChange: (formValue, originalRole) => {
            const role = { ...originalRole, ...formValue };
            dispatch(ROLE_UPDATE(role));
        },
        onSaveUpdatedRole: (role) => {
            axios
                .post('/authservice/useradmin/api/role/modify', role)
                .then(result => dispatch(ROLES_RECEIVED(result.data)))
                .catch(error => dispatch(ROLES_ERROR(error)));
            dispatch(ROLE_UPDATE({ ...emptyRole }));
        },
    };
};

RoleModify = connect(mapStateToProps, mapDispatchToProps)(RoleModify);

export default RoleModify;
