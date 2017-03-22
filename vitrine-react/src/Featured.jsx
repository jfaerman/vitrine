import React, {Component} from 'react';
class Featured extends Component {

    render() {
        return (
	         <li>{this.props.label}</li>
        );
    }
}

export default Featured;
