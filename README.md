# alight-ui
UI Components for Argular Light

### Instalando dependências

```sh
$ sudo apt-get install nodejs
$ sudo apt-get install npm
$ sudo npm install --global gulp
$ sudo npm install -g bower
```

### Baixando pacotes externos

```sh
$ cd /path/to/alight-ui/bower/
$ bower install
$ # os pacotes serão adicionados na pasta /path/to/alight-ui/vendor/
```

### Instalando dependências do Gulp

```sh
$ cd /path/to/alight-ui/gulp/
$ npm init
$ # os pacotes serão adicionados na pasta /path/to/alight-ui/vendor/
```

### Compilando um pacote personalizado
```sh
$ cd /path/to/alight-ui/gulp/
$ # edit: Gulpfile.js
$ # modifique: var al_files = [Arquivos necessários para o seu pacote];
$ # salvar.
$ gulp
```
