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

/**
 *
 * @todo: add choice to select model
 * @todo: Create form component for signin and register
 * @todo: Split components into smaller ones
 */

const initialState = {
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

class App extends Component {
	constructor( props ) {
		super( props );
		this.state = initialState;
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

		fetch( '//localhost:3000/imageurl', {
			method : 'POST',
			headers: { 'Content-Type': 'application/json' },
			body   : JSON.stringify( { input: this.state.input } ),
		} )
			.then( response => response.json() )
			.then( result => {
				if ( result ) {
					fetch( '//localhost:3000/image', {
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
			this.setState( initialState );
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
