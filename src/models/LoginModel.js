const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');

const LoginSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true }
});

const LoginModel = mongoose.model('Login', LoginSchema);

class Login {
  constructor(body) {
    this.body = body;
    this.errors = [];
    this.user = null;
  }

  async login() {
    this.valida();
    
    if (this.errors.length > 0) return;
    //procura email
    this.user = await LoginModel.findOne({ email: this.body.email });

    //verifica se existe
    if(!this.user){
      this.errors.push("Usuário não existe");
      return;
    };

    //verifica a senha encriptada
    if(!bcryptjs.compareSync(this.body.password, this.user.password)){
      this.errors.push("Senha inválida");
      this.user= null;
      return;
    };
  };

  async register() {
    this.valida();
    //verifica se tem erros
    if (this.errors.length > 0) return;

    await this.userExists();

    if (this.errors.length > 0) return;
    //encripta a senha
    const salt = bcryptjs.genSaltSync();
    this.body.password = bcryptjs.hashSync(this.body.password, salt);

   
    this.user = await LoginModel.create(this.body);
  };

  //verifica se o email ja existe
  async userExists() {
    this.user = await LoginModel.findOne({ email: this.body.email });
    if(this.user) this.errors.push("Usuário já cadastrado com esse e-mail");
  }

  valida() {
    //validas email e senha
    this.cleanUp();

    if (!validator.default.isEmail(this.body.email)) this.errors.push("e-mail inválido");

    if (this.body.password.length < 3 || this.body.password.length > 20) {
      this.errors.push("a senha tem estar entre 3 a 20 caracteres.");
    }
  }

  //limpra os dados
  cleanUp() {
    for (const key in this.body) {
      if (typeof this.body[key] !== 'string') {
        this.body[key] = '';
      }
    }
    this.body = {
      email: this.body.email,
      password: this.body.password
    };
  };
};
module.exports = Login;
