const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

const recordingRoutes = require('./recordZoom');

app.use(cors({
    origin:['*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
    credentials: true // Si usas cookies o headers de autenticación
    }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.set('port', process.env.PORT || 8000);

app.use('/recording',recordingRoutes);

app.get('/',(req,res)=>{
    res.status(200).json({
        status: true,
        msg: 'Root route working'
    });
});

app.post('/upload', express.raw({ limit: '10gb', type: 'video/webm' }), (req, res) => {
  fs.writeFileSync('/home/ubuntu/zoom_recording.webm', req.body);
  res.sendStatus(200);
});

app.listen(app.get('port'), ()=>{
    console.log('Server running on port: ', app.get('port'));
});

