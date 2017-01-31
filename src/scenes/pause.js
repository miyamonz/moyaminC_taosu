const LOAD = require("../loadFiles.js")
let sound;

module.exports = function(core){
  sound = require("../sound.js")(core)
  return function(stageNumber, stageMode){
    var scene = new Scene();
    scene.backgroundColor = "rgba( 0, 0, 0, 0.6 )"; //半透明の画面をゲームシーンの上に重ねる
    //ポーズの文字を表示
    var pauseLabel = new Label("P A U S E")
    pauseLabel.color = 'white';
    pauseLabel.font = '64px "Arial"';
    pauseLabel.moveTo((core.width-pauseLabel.width)/2,100);
    scene.addChild(pauseLabel);
    //ポーズ画面解除方法を表示
    var pauseLabel = new Label("P r e s s\   \"P\"\   k e y\   t o\   b a c k . ")
    pauseLabel.color = 'white';
    pauseLabel.font = '24px "Arial"';
    pauseLabel.width = 400;
    pauseLabel.moveTo((core.width-pauseLabel.width)/2+20,400);
    scene.addChild(pauseLabel);
    //タイトル画面に戻るボタン
    var button = new Button("Title", "light");
    button.x = 10;
    button.y = 500;
    scene.addChild(button);
    //タイトル画面に戻るボタンを押した時のアクション
    button.ontouchstart = function(){
      core.gameoverNum = 0;     //ゲームオーバー合計回数をリセット
      core.playerDamgeNum = 0;  //被ダメージ合計回数をリセット
      //BGM停止
      sound.currentScene = stageNumber;
      sound.bgmPlay("stop")
      core.replaceScene(createGameStartScene());  //タイトル画面に戻る
    }
    volumeScene(scene);            //BGM&SE音量調節を表示
    //ポーズ画面解除
    scene.addEventListener('bbuttondown', function(){
      core.popScene();      //ポーズ画面を取り去る
      //BGM再生
      sound.currentScene = stageNumber;
      sound.bgmPlay("play")
      //制限時間が減るの開始
      timeLabel.pause = false;
    } );
    core.pushScene( scene );  //ここでpushしてSceneを重ねる
  }
}

function volumeScene(scene) {

  var xLayout = -110 //横の位置を調整する
  //VOLUEME：BGMの文字を表示
  var pauseLabel = new Label("VOLUEME：BGM")
  pauseLabel.color = 'white';
  pauseLabel.font = '24px "Arial"';
  pauseLabel.moveTo(330 + xLayout,220);
  scene.addChild(pauseLabel);
  //現在のBGM音量を表示
  var masterBgmNow = new Label("")
  masterBgmNow.color = 'white';
  masterBgmNow.font = '24px "Arial"';
  masterBgmNow.moveTo(720 + xLayout, 220);
  masterBgmNow.text = sound.bgmVolume;
  scene.addChild(masterBgmNow);
  //(0~20)の文字を表示
  var pauseLabel = new Label("(0〜20)")
  pauseLabel.color = 'white';
  pauseLabel.font = '24px "Arial"';
  pauseLabel.moveTo(770+ xLayout,220);
  scene.addChild(pauseLabel);
  //VOLUEME：SEの文字を表示
  var pauseLabel = new Label("VOLUEME：SE")
  pauseLabel.color = 'white';
  pauseLabel.font = '24px "Arial"';
  pauseLabel.moveTo(330 + xLayout,280);
  scene.addChild(pauseLabel);
  //現在のSE音量を表示
  var masterSeNow = new Label("")
  masterSeNow.color = 'white';
  masterSeNow.font = '24px "Arial"';
  masterSeNow.moveTo(720 + xLayout, 280);
  masterSeNow.text = sound.seVolume;
  scene.addChild(masterSeNow);
  //(0~20)の文字を表示
  var pauseLabel = new Label("(0〜20)")
  pauseLabel.color = 'white';
  pauseLabel.font = '24px "Arial"';
  pauseLabel.moveTo(770 + xLayout,280);
  scene.addChild(pauseLabel);

  //BGM音量あげるボタン
  var buttonBgmUp = new Button("▲", "light");
  buttonBgmUp.x = 650+ xLayout;
  buttonBgmUp.y = 220;
  scene.addChild(buttonBgmUp);
  //ボタンを押した時のアクション
  buttonBgmUp.ontouchstart = function(){
    sound.addVolumeBGM(1);
    sound.applyVolumes();
    masterBgmNow.text = sound.bgmVolume;
  }
  //SE音量あげるボタン
  var buttonSeUp = new Button("▲", "light");
  buttonSeUp.x = 650+ xLayout;
  buttonSeUp.y = 280;
  scene.addChild(buttonSeUp);
  //ボタンを押した時のアクション
  buttonSeUp.ontouchstart = function(){
    sound.addVolumeSE(1);
    sound.applyVolumes();
    masterSeNow.text = sound.seVolume;
  }

  //BGM音量下げるボタン
  var buttonBgmDown = new Button("▼", "light");
  buttonBgmDown.x = 600+ xLayout;
  buttonBgmDown.y = 220;
  scene.addChild(buttonBgmDown);
  //ボタンを押した時のアクション
  buttonBgmDown.ontouchstart = function(){
    sound.addVolumeBGM(-1);
    sound.applyVolumes();
    masterBgmNow.text = sound.bgmVolume;
  }

  //SE音量下げるボタン
  var buttonSeDown = new Button("▼", "light");
  buttonSeDown.x = 600+ xLayout;
  buttonSeDown.y = 280;
  scene.addChild(buttonSeDown);
  //ボタンを押した時のアクション
  buttonSeDown.ontouchstart = function(){
    sound.addVolumeSE(-1);
    sound.applyVolumes();
    masterSeNow.text = sound.seVolume;
  }

}
