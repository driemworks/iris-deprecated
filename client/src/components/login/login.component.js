import React, { Component } from "react";
import { Button, Form, FormGroup, Input, FormText, Spinner } from 'reactstrap';

import { withRouter } from 'react-router-dom';

import { If, Else } from 'rc-if-else';

import './login.component.css';
import EthService from "../../service/eth.service";

class LoginComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            alias: '',
            password: '',
            incorrectPassword: false,
            incorrectUsername: false,
            isLoading: false
        };
    }

    async accept() {
        try {
            this.setState({ incorrectPassword: false, isLoading: true });
            await EthService.initVault(this.state.password, this.state.alias, () => {
                this.setState({ incorrectUsername : true });
            });
            this.props.history.push('/inbox');
            // this.forceUpdate();
        } catch (err) {
            console.log(err);
            this.setState({ isLoading: false });
            this.setState({ incorrectPassword: true });
        }
    }

    setPassword(e) {
        this.setState({ password: e.target.value, incorrectPassword: false })
    }

    setAlias(e) {
        this.setState({ alias: e.target.value, incorrectUsername: false })
    }

    render() {
        this.accept      = this.accept.bind(this);
        this.setPassword = this.setPassword.bind(this);
        this.setAlias    = this.setAlias.bind(this);
        return (
            <div className="login-component-container" onKeyDown={event => {
                if (event.key === 'Enter') {
                    this.accept()
                }
            }}>
                {/* <div className="login-component-name-container">
                    Iris
                </div> */}
                <div className="login-form-container">
                    <Form>
                        <FormGroup className="iris-form-group">
                            <Input color="primary" className="shadow-sm password-input" type="text" name="password" id="password" placeholder="Enter alias" 
                                   onChange={this.setAlias}/>
                            <Input color="primary" className="shadow-sm password-input" type="password" name="password" id="password" placeholder="Enter password" 
                                   onChange={this.setPassword}/>
                            <If condition={this.state.isLoading === true}>
                                <Spinner color="primary" />
                                <Else>
                                    <Button className="login-submit-button" 
                                        onClick={this.accept}>
                                            Submit
                                    </Button>
                                    <FormText className="login-form-text">
                                        <If condition={this.state.incorrectUsername === false && this.state.incorrectPassword === false}>
                                            Enter a password to login to your existing account, or a new password to create a new account.
                                            A user can only create one account per device.
                                            <p className="danger-text">
                                                Currently, usernames and passwords are NON-RECOVERABLE, so make sure you don't forget it. 
                                            </p>
                                            <Else>
                                                <span>Incorrect username/password for this device.</span>
                                            </Else>
                                        </If>
                                    </FormText>    
                                </Else>
                            </If>
                            {/* <Button className="login-submit-button" 
                                    onClick={this.accept}>
                                        Submit
                            </Button>
                            <FormText className="login-form-text">
                                <If condition={this.state.incorrectUsername === false && this.state.incorrectPassword === false}>
                                    Enter a password to login to your existing account, or a new password to create a new account.
                                    A user can only create one account per device.
                                    <p className="danger-text">
                                        Currently, usernames and passwords are NON-RECOVERABLE, so make sure you don't forget it. 
                                    </p>
                                    <Else>
                                        <span>Incorrect username/password for this device.</span>
                                    </Else>
                                </If>
                            </FormText> */}
                        </FormGroup>
                    </Form>
                </div>
            </div>
        );
    }
}

export default withRouter(LoginComponent);