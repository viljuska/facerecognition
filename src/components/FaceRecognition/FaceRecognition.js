import './FaceRecognition.css';

const FaceRecognition = ( { imageUrl, box } ) => {
	return (
		<div className="center ma">
			<div className="relative mt2">
				<img alt="" src={ imageUrl } width="300px" height="auto" id="inputimage"/>
				{ ( box.topRow || box.rightCol || box.bottomRow || box.leftCol ) &&
					<div className="bounding-box"
					     style={ {
						     top   : box.topRow,
						     right : box.rightCol,
						     bottom: box.bottomRow,
						     left  : box.leftCol,
					     } }>
					</div>
				}
			</div>
		</div>
	);
};

export default FaceRecognition;