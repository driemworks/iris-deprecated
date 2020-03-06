import React, { Component } from "react";
import UserService from "../../service/user.service";
import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';

import './login.component.css';
import EthService from "../../service/eth.service";

class LoginComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            password: ''
        };
    }

    async acceptPassword() {
        await EthService.initVault(this.state.password);
        // await UserService.getEthUser(this.state.password);
    }

    setPassword(e) {
        this.setState({ password: e.target.value })
    }

    render() {
        this.acceptPassword = this.acceptPassword.bind(this);
        this.setPassword    = this.setPassword.bind(this);
        return (
            <div className="login-component-container">
                <div className="login-component-name-container">
                    Iris
                </div>
                <div className="login-form-container">
                    <Form>
                        <FormGroup className="iris-form-group">
                            <Input color="primary" className="shadow-sm password-input" type="password" name="password" id="password" placeholder="Enter password" onChange={this.setPassword}/>
                            <Button onClick={this.acceptPassword}>Submit</Button>
                            <FormText>
                                Enter a password to login to your existing account, or a new password to create a new account.
                                A user can only create one account per device.
                            </FormText>
                        </FormGroup>
                    </Form>
                </div>
            </div>
        );
    }
}

export default LoginComponent;