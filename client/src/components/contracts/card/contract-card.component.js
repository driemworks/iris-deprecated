import PropTypes from 'prop-types';
import React from 'react';
import {
    Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle, Button,
    Modal, ModalHeader, ModalBody, ModalFooter
  } from 'reactstrap';

import { If, Else } from 'rc-if-else';
import './contract-card.component.css';

class ContractCardComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            modal: false
        };
    }

    toggle() {
        this.setState({modal: true});
    }

    async confirm() {
        await this.props.onConfirm();
        this.setState({modal: false});
    }

    cancel() {
        this.setState({modal: false});
    }

    render() {
        this.toggle = this.toggle.bind(this);
        this.cancel = this.cancel.bind(this);
        return (
            <div className="contracts-container">
                <div>
                    <Card className="contract-card">
                    {/* require(this.props.headerImage)} */}
                        <CardImg className="contract-card-img" width="50%" 
                                src={this.props.headerImage} alt={this.props.contractName} />
                        <CardBody>
                            <CardTitle>{this.props.contractName}</CardTitle>
                            <CardText>
                                {this.props.cardText}
                            </CardText>
                            <If condition={this.props.onConfirm}>
                                <Button color="primary" onClick={this.toggle}>Submit</Button>
                                <Modal isOpen={this.state.modal} fade={false}
                                    toggle={this.toggle} className="modal-container">
                                    <ModalHeader toggle={this.toggle}>
                                        Deploy Contract
                                    </ModalHeader>
                                    <ModalBody>
                                        This will cost ethereum in order to deploy the contract.
                                    </ModalBody>
                                    <ModalFooter className="modal-footer-container">
                                        <Button className="confirm action-button" onClick={this.confirm.bind(this)} color="success">
                                            Confirm
                                        </Button>
                                        <Button className="cancel action-button" onClick={this.cancel} color="danger">
                                            Cancel
                                        </Button>
                                    </ModalFooter>
                                </Modal>
                            </If>
                        </CardBody>
                    </Card>
                </div>
            </div>
        );
    }
}

ContractCardComponent.propTypes = {
    headerImage: PropTypes.string,
    contractName: PropTypes.string,
    cardText: PropTypes.string,
    onConfirm: PropTypes.func
};
export default ContractCardComponent;