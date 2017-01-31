const LOAD = require("../loadFiles.js")
const VERSION = require("../config.js").version
let sound;

module.exports = function(core){
  sound = require("../sound.js")(core)
  const createGameScene = require("./gameScene.js")(core)
  return function(){
    var scene = new Scene();
    var backGround = new Sprite(960, 540);
    backGround.image = core.assets[LOAD.IMG.BACKGROUND_IMG];
    scene.addChild(backGround);
    //タイトル文字
    var title = new Sprite(645,90);
    title.image = core.assets[LOAD.IMG.TITLE_IMG];
    title.x = (scene.width - title.width) / 2;
    title.y = 100;
    scene.addChild(title);
    //操作説明
    var howToPlay = new Label("ショット：Xキー     移動：十字キー");
    howToPlay.width = 400;
    howToPlay.x = scene.width / 2 - howToPlay.width /2;
    howToPlay.y = 240;
    howToPlay.color = 'white';
    howToPlay.font = '24px "Arial"';
    scene.addChild(howToPlay);
    //操作説明
    var howToPlay2 = new Label("ポーズ画面：Pキー（BGMと効果音の音量調整ができます）");
    howToPlay2.width = 500;
    howToPlay2.x = scene.width / 2 - howToPlay.width /2;
    howToPlay2.y = 300;
    howToPlay2.color = 'white';
    howToPlay2.font = '18px "Arial"';
    scene.addChild(howToPlay2);
    //バージョン表示
    var verLabel = new Label("Ver. " + VERSION)
    verLabel.x = 10;
    verLabel.y = 10;
    verLabel.color = 'white';
    verLabel.font = '16px "Arial"';
    scene.addChild(verLabel);
    //「RANK：」の文字を表示
    var rank = new Label("RANK：");
    rank.x = 770;
    rank.y = 15;
    rank.color = 'white';
    rank.font = '18px "Arial"';
    scene.addChild(rank);
    //プレイヤーの最高ランク表示
    var rankLabel = new Label("");
    rankLabel.x = rank.x + 70;
    rankLabel.y = 10;
    if (localStorage.getItem("rankPlayerText") == null) {
      rankLabel.y = 15;
      rankLabel.text = 'BEGINNER';
      rankLabel.font = '18px "Arial"';
      rankLabel.color = 'white';
    } else {
      rankLabel.text = localStorage.getItem("rankPlayerText");
      rankLabel.font = '24px "Arial"';
      rankLabel.color = localStorage.getItem("rankPlayerColor");
    }
    scene.addChild(rankLabel);

    //タイムアタックモード解禁（RANK：S以上）
    if (localStorage.getItem("rankPlayerText") == "S" || localStorage.getItem("rankPlayerText") == "SS" || localStorage.getItem("rankPlayerText") == "MASTER") {
      //「BEST TIME：」の文字を表示
      var time = new Label("BEST TIME：");
      time.x = 725;
      time.y = 45;
      time.color = 'white';
      time.font = '18px "Arial"';
      scene.addChild(time);
      //ベストタイム表示
      var timeLabel = new Label("");
      timeLabel.x = time.x + 115;
      timeLabel.y = 40;
      if (localStorage.getItem("totalTime") == null) {
        timeLabel.text = '999.99';
        timeLabel.font = '24px "Arial"';
        timeLabel.color = 'white';
      } else {
        timeLabel.text = JSON.parse(localStorage.getItem("totalTime"));
        timeLabel.font = '24px "Arial"';
        timeLabel.font = '24px "Arial"';
        timeLabel.color = 'white';
      }
      scene.addChild(timeLabel);
      //タイムアタックモード開始ボタン
      var button = new Button("Speed Run!", "light");
      button.x = scene.width / 2 + 100;
      button.y = 360;
      button.scale(1.5);
      scene.addChild(button);
      //ボタンを押した時のアクション
      button.ontouchstart = function(){
        core.replaceScene(createGameScene(1, 1));
      }
    }
    //スタートボタン
    var button = new Button("Play!", "light");
    button.x = scene.width / 2 - 80;
    button.y = 350;
    button.scale(2);
    scene.addChild(button);
    //ボタンを押した時のアクション
    button.ontouchstart = function(){
      core.replaceScene(createGameScene(1, 0));
    }
    //リセットボタン
    var resetbutton = new Button("Reset", "dark");
    resetbutton.x = 10;
    resetbutton.y = 500;
    resetbutton.scale(1);
    scene.addChild(resetbutton);
    //ボタンを押した時のアクション
    resetbutton.ontouchstart = function(){
      var answer = confirm('リセットしますか？最高プレイヤーランクやベストクリアタイムが消えます.');
      if (answer) {
        //このゲームに関連するローカルストレージのデータを全消去
        localStorage.removeItem("totalTime");
        localStorage.removeItem("rankcount");
        localStorage.removeItem("rankPlayerText");
        localStorage.removeItem("rankPlayerColor");
        core.replaceScene(createGameStartScene());  //タイトル画面更新
      }
    }
    return scene;
  }
}
