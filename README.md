# alight-ui
UI Components for Argular Light

### Instalando dependências

```sh
$ sudo apt-get install nodejs
$ sudo apt-get install npm
$ sudo npm install --global gulp
$ sudo npm install -g bower
```

```sh
$ cd /path/to/alight-ui/
$ mkdir vendor
$ cd gulp/
$ npm init
$ cd ../vendor/
$ npm init
```

### Compilando um pacote personalizado
```sh
$ # edit: /path/to/alight-ui/gulp/Gulpfile.js
$ # modifique: var al_files = [Arquivos necessários para o seu pacote];
$ # salvar.
$ gulp
```
