import './App.css';
import Navigation      from './components/Navigation/Navigation';
import 'tachyons';
import Logo            from './components/Logo/Logo';
import ImageLinkForm   from './components/ImageLinkForm/ImageLinkForm';
import Rank            from './components/Rank/Rank';
import ParticlesBg     from 'particles-bg';
import { Component }   from 'react';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Signin          from './components/Signin/Signin';
import Register        from './components/Register/Register';

const setupClarifaiRequest = ( imageUrl ) => {
	const PAT     = 'a902e646fca3485688eeae7d1b8a1e9d';
	const USER_ID = 'viljuska';
	const APP_ID  = 'facerecognitionbrain';
	const raw     = JSON.stringify( {
		'user_app_id': {
			'user_id': USER_ID,
			'app_id' : APP_ID,
		},
		'inputs'     : [
			{
				'data': {
					'image': {
						'url': imageUrl,
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
			input     : '',
			imageUrl  : '',
			box       : {},
			route     : 'signin',
			isSignedIn: false,
			user      : {
				id      : 0,
				name    : '',
				email   : '',
				password: '',
				entries : 0,
				joined  : '',
			},
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
		const { user: { id } } = this.state;

		this.setState( { imageUrl: this.state.input } );

		// todo: add choice to select model
		fetch( 'https://api.clarifai.com/v2/models/' + 'face-detection' + '/outputs', setupClarifaiRequest( this.state.input ) )
			.then( response => response.json() )
			.then( result => {
				if ( result ) {
					fetch( 'http://localhost:3000/image', {
						method : 'PUT',
						headers: { 'Content-Type': 'application/json' },
						body   : JSON.stringify( { id } ),
					} )
						.then( response => response.json() )
						.then( count => {
							// This way, we only assign one value to the object, and not the whole object
							this.setState( Object.assign( this.state.user, { entries: count } ) );
						} )
						.catch( console.log );
				}
				this.setBox( this.calculateFaceLocation( result ) );
			} )
			.catch( error => console.log( 'error', error ) );
	};

	onRouteChange = ( route ) => {
		if ( route === 'signout' ) {
			this.setState( { isSignedIn: false } );
		} else if ( route === 'home' ) {
			this.setState( { isSignedIn: true } );
		}

		this.setState( { route } );
	};

	loadUser = ( { id, name, email, entries, joined } ) => {
		this.setState( {
			user: {
				id     : id,
				name   : name,
				email  : email,
				entries: entries,
				joined : joined,
			},
		} );
	};

	render() {
		const { isSignedIn, route, imageUrl, box } = this.state;

		return (
			<div className="App">
				<ParticlesBg type="cobweb" bg={ true }/>
				<Navigation onRouteChange={ this.onRouteChange } isSignedIn={ isSignedIn }/>
				{ route === 'home' ?
					<div>
						<Logo/>
						<Rank username={ this.state.user.name } entries={ this.state.user.entries }/>
						<ImageLinkForm onInputChange={ this.onInputChange } onButtonSubmit={ this.onButtonSubmit }/>
						<FaceRecognition imageUrl={ imageUrl } box={ box }/>
					</div> :
					(
						route === 'signin' ?
							<Signin onRouteChange={ this.onRouteChange } loadUser={ this.loadUser }/> :
							<Register onRouteChange={ this.onRouteChange } loadUser={ this.loadUser }/>
					)
				}
			</div>
		);
	}
}

export default App;
