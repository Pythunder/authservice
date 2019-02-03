import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { PERMISSIONS_RECEIVED, PERMISSIONS_ERROR, PERMISSION_UPDATE } from './actiontypes';
import PermissionSelect from './components/PermissionSelect';
import { emptyPermission } from './constants';

class PermissionModify extends Component {
    constructor(props) {
        super(props);
        this.state = { ...props };
    }

    componentDidMount() {
        this.props.onPermissions();
    }

    componentWillReceiveProps(props) {
        this.setState({ ...props });
    }

    render () {
        let {
            permissions,
            permissionsMap,
            permission,
            onPermissionsFieldChange,
            onFieldChange,
            onSaveUpdatedPermission,
        } = this.state;

        return (
            <div>
                <h1>Modify permission information</h1>
                <br/>
                <Link to="/authservice/useradmin/permissions">Up to permission adminstration</Link><br/>
                <form onSubmit={ e => { e.preventDefault(); }}>
                    <label htmlFor="permissions">Select permission</label>
                    <PermissionSelect id="permissions" permissions={permissions} permissionsMap={permissionsMap} value={permission.permissionname} onPermissionsFieldChange={onPermissionsFieldChange} />
                    <br/>
                    <label htmlFor="permissionname">Permission name</label>
                    <input id="permissionname" type="text" value={permission.permissionname} onChange={(event) => onFieldChange({permissionname: event.target.value}, permission)} />
                    <br/>
                    <label htmlFor="email">Permission description</label>
                    <input id="description" type="text" value={permission.description} onChange={(event) => onFieldChange({description: event.target.value}, permission)} />
                    <br/>
                    <button onClick={() => onSaveUpdatedPermission(permission)}>Save changes to permission</button>
                </form>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        permissions: state.permissions,
        permissionsMap: new Map(state.permissions.map(i => [i.permissionname, i])),
        permission: state.permission,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onPermissions: () => {
            axios
                .get('/authservice/useradmin/api/permissions')
                .then(result => dispatch({ type: PERMISSIONS_RECEIVED, payload: result.data }))
                .catch(error => dispatch({ type: PERMISSIONS_ERROR, payload: error }));
        },
        onPermissionsFieldChange: (selectedValue, permissionsMap) => {
            let permission = permissionsMap.get(selectedValue);
            dispatch({ type: PERMISSION_UPDATE, payload: permission });
        },
        onFieldChange: (formValue, originalPermission) => {
            const permission = { ...originalPermission, ...formValue };
            dispatch({ type: PERMISSION_UPDATE, payload: permission });
        },
        onSaveUpdatedPermission: (permission) => {
            axios
                .post('/authservice/useradmin/api/permission/modify', permission)
                .then(result => dispatch({ type: PERMISSIONS_RECEIVED, payload: result.data }))
                .catch(error => dispatch({ type: PERMISSIONS_ERROR, payload: error }));
            dispatch({ type: PERMISSION_UPDATE, payload: { ...emptyPermission } });
        },
    };
};

PermissionModify = connect(mapStateToProps, mapDispatchToProps)(PermissionModify);

export default PermissionModify;
