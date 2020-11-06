import React, { Component } from "react";
import { Button, Form, FormGroup, Input, FormText, Spinner } from 'reactstrap';

import { withRouter } from 'react-router-dom';

import { If, Else } from 'rc-if-else';

import './login.component.css';
import EthService from "../../service/eth.service";
import { MercuryApiService, MerucryApiService } from "../../service/mercury.service";
import store from "../../state/store";
import { addError } from "../../state/actions";

class LoginComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            password: '',
            incorrectPassword: false,
            incorrectUsername: false,
            isLoading: false
        };
    }

    async accept() {
        try {
            this.setState({ incorrectPassword: false, isLoading: true });
            await EthService.initVault(this.state.password);
            this.props.history.push('/inbox');
        } catch (err) {
            this.setState({ isLoading: false });
            this.setState({ incorrectPassword: true });
            store.dispatch(addError({
                message: 'Password is incorrect.'
            }));
        }
    }

    setPassword(e) {
        this.setState({ 
            password: e.target.value, 
            incorrectPassword: false 
        });
    }

    render() {
        this.accept      = this.accept.bind(this);
        this.setPassword = this.setPassword.bind(this);
        return (
            <div className="login-component-container" onKeyDown={event => {
                if (event.key === 'Enter') {
                    this.accept()
                }
            }}>
                <div className="login-form-container">
                    <Form>
                        <FormGroup className="iris-form-group">
                            <Input color="primary" className="shadow-sm password-input" type="password" name="password" id="password" placeholder="Enter password" 
                                   onChange={this.setPassword}/>
                            <Button className="login-submit-button" 
                                onClick={this.accept}>
                                    Submit
                            </Button>
                        </FormGroup>
                    </Form>
                </div>
            </div>
        );
    }
}

export default withRouter(LoginComponent);