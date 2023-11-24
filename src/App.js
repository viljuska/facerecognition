import './App.css';
import Navigation      from './components/Navigation/Navigation';
import 'tachyons';
import Logo            from './components/Logo/Logo';
import ImageLinkForm   from './components/ImageLinkForm/ImageLinkForm';
import Rank            from './components/Rank/Rank';
import ParticlesBg     from 'particles-bg';
import { Component }   from 'react';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';

const setupClarifaiRequest = ( imageUrl ) => {
	const PAT       = 'a902e646fca3485688eeae7d1b8a1e9d';
	const USER_ID   = 'viljuska';
	const APP_ID    = 'facerecognitionbrain';
	// const MODEL_ID  = 'face-detection';
	const IMAGE_URL = imageUrl;

	const raw = JSON.stringify( {
		'user_app_id': {
			'user_id': USER_ID,
			'app_id' : APP_ID,
		},
		'inputs'     : [
			{
				'data': {
					'image': {
						'url': IMAGE_URL,
					},
				},
			},
		],
	} );

	return {
		method : 'POST',
		headers: {
			'Accept'       : 'application/json',
			'Authorization': 'Key ' + PAT,
		},
		body   : raw,
	};
};

class App extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			input   : '',
			imageUrl: '',
			box     : {},
		};
	}

	calculateFaceLocation = ( data ) => {
		const clarifaiFace = data.outputs[ 0 ].data.regions[ 0 ].region_info.bounding_box;
		const image        = document.getElementById( 'inputimage' );
		const width        = Number( image.width );
		const height       = Number( image.height );

		return {
			topRow   : clarifaiFace.top_row * height,
			rightCol : width - ( clarifaiFace.right_col * width ),
			bottomRow: height - ( clarifaiFace.bottom_row * height ),
			leftCol  : clarifaiFace.left_col * width,
		};
	};

	onInputChange = ( event ) => {
		this.setState( { input: event.target.value } );
	};

	setBox = ( box ) => {
		this.setState( { box } );
	};

	onButtonSubmit = () => {
		this.setState( { imageUrl: this.state.input } );

		fetch( 'https://api.clarifai.com/v2/models/' + 'face-detection' + '/outputs', setupClarifaiRequest( this.state.input ) )
			.then( response => response.json() )
			.then( result => {
				this.setBox( this.calculateFaceLocation( result ) );
			} )
			.catch( error => console.log( 'error', error ) );
	};

	render() {
		return (
			<div className="App">
				<ParticlesBg type="circle" bg={ true }/>
				<Navigation/>
				<Logo/>
				<Rank/>
				<ImageLinkForm onInputChange={ this.onInputChange } onButtonSubmit={ this.onButtonSubmit }/>
				<FaceRecognition imageUrl={ this.state.imageUrl } box={ this.state.box }/>
			</div>
		);
	}
}

export default App;
