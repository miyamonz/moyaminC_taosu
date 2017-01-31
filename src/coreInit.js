const LOAD = require("./loadFiles.js")

module.exports = function (core) {
  //replaceSceneでメモリが増えないように, 現在のシーンに存在するノードを全て削除してからシーンを切り替える
  core.replaceScene=function(scene) {
    var currentScene = core.popScene();
    while (currentScene.childNodes.length > 0) {
      　currentScene.removeChild(currentScene.childNodes[0]);
    }
    return core.pushScene(scene);
  }
  //ゲームで使用する画像およびBGM等を読み込む
  core.preload(Object.values(LOAD.IMG));
  core.preload(Object.values(LOAD.BGM));
  core.preload(Object.values(LOAD.SE));
  //fps設定
  core.fps = 30;
  //BGM&効果音のマスター音量
  core.gameoverNum = 0;     //ゲームオーバーになった合計回数
  core.playerDamgeNum = 0;  //プレイヤーが受けたダメージの合計回数
  core.bolumeStep = Math.round((0.04/100)*1000)/1000; //0.002の1/100を小数第三位まで
  //ショットのキーバインド
  core.keybind( 'X'.charCodeAt(0), 'a' );
  core.keybind( 'P'.charCodeAt(0), 'b' );
}
