import Konva from 'konva';

try {
  const stage = new Konva.Stage({
    container: document.createElement('div'),
    width: 500,
    height: 500
  });
  
  // UUIDs often start with a number
  const id = '371b32f0-542e-43e3-aa39-4af4796112b1';
  stage.findOne(`#${id}`);
  console.log('SUCCESS');
} catch (e) {
  console.log('ERROR:', e.message);
}
