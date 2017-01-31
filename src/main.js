const LOAD = require("./loadFiles.js")
const coreInit = require("./coreInit.js")
const sceneList = require("./sceneList.js");

enchant();
window.onload = function() {
  var core = new Core(960, 540);
  coreInit(core)
  var stageClearTimeArray = new Array();
  core.onload = function() {
    //BGMおよびSEを流すクラス
    const sound = require("./sound.js")(core);
    sound.initialize();

    //自機と敵と玉のspriteを生成
    let Player    = require("./sprites/Player.js")(core);
    let Tama      = require("./sprites/Tama.js")(core);
    let Boss      = require("./sprites/Boss.js")(core);
    let EnemyTama = require("./sprites/EnemyTama.js")(core);

    var createGameScene = require("./scenes/gameScene.js")(core);
    var createGamePauseScene = require("./scenes/pause.js")(core);

    //ゲームオーバー画面
    var createGameOverScene = function(boss, stageLabel, stageNumber, timeLabel, stageMode){
      var scene = new Scene();
      var backGround = new Sprite(960, 540);
      backGround.image = core.assets[LOAD.IMG.BACKGROUND_IMG];
      scene.addChild(backGround);
      scene.addChild(stageLabel);
      scene.addChild(boss);
      scene.addChild(timeLabel);
      boss.lifeLabel(scene);
      //ゲームオーバーの文字
      var gameover = new Sprite(189, 97);
      gameover.image = core.assets[LOAD.IMG.GAMEOVER_IMG];
      gameover.scale(2.8);
      gameover.x = (core.width - gameover.width) / 2 ;
      gameover.y = 175;
      scene.addChild(gameover);
      //タイトル画面に戻るボタン
      var button = new Button("Back to Title", "dark");
      button.x = 100;
      button.y = 450;
      //タイトル画面に戻るボタンを押した時のアクション
      button.ontouchstart = function(){
        core.gameoverNum = 0;     //ゲームオーバー合計回数をリセット
        core.playerDamgeNum = 0;  //被ダメージ合計回数をリセット
        core.replaceScene(createGameStartScene());  //タイトル画面に戻る
      }
      //再挑戦するボタン
      var retryButton = new Button("Retry", "dark");
      retryButton.x = scene.width / 2 - 60;
      retryButton.y = 400;
      retryButton.scale(2);
      //再挑戦ボタンは通常モードの時のみ表示（タイムアタックモードは一回ゲームオーバしたらタイトルに戻る）
      if (stageMode == 0) {
        //再挑戦するボタンを押した時のアクション
        retryButton.ontouchstart = function(){
          core.replaceScene(createGameScene(stageNumber, 0));  //同じステージを再挑戦
        }
        scene.addChild(retryButton);
        scene.addChild(button);
      } else if (stageMode == 1) {
        button.x = scene.width / 2 - 100;
        button.y = 400;
        button.scale(2);
        scene.addChild(button);
      }
      return scene;
    }

    //ゲームクリア画面
    var createGameClearScene = function(player, stageLabel, stageNumber, timeLabel, stageMode){
      var scene = new Scene();
      var backGround = new Sprite(960, 540);
      backGround.image = core.assets[LOAD.IMG.BACKGROUND_IMG];
      scene.addChild(backGround);
      scene.addChild(player);
      scene.addChild(stageLabel);
      scene.addChild(timeLabel);
      for (var i = 0; i < player.life; i++) {
        scene.addChild(player.myLifeLabel[i]);
      }
      //ゲームクリアの文字
      var clearLabel = new Sprite(267, 48)
      clearLabel.image = core.assets[LOAD.IMG.CLEAR_IMG];
      clearLabel.scale(2.8);
      clearLabel.x = (scene.width - clearLabel.width) / 2 ;
      clearLabel.y = 190;
      //ゲームクリアの文字を表示
      player.tl.delay(10).then(function(){
        scene.addChild(clearLabel);
      });
      //タイトル画面に戻るボタン
      var button = new Button("Back to Title!", "dark");
      button.x = 100;
      button.y = 450;
      //次のステージに進むボタン
      var nextButton = new Button("Next Stage!", "light");
      nextButton.x = scene.width / 2 - 100;
      nextButton.y = 350;
      nextButton.scale(2);
      //時間差でタイトル画面に戻る等をボタンを表示
      player.tl.delay(75).then(function(){
        if (stageMode == 1) {
          //ステージクリアタイム（タイムアタックモードの時のみ）
          for (var i = 0; i < stageNumber; i++) {
            var stageClearTimeLabel = new Label("");
            stageClearTimeLabel.moveTo(scene.width/2 +230, 340 + i * 30);
            stageClearTimeLabel.color = 'white';
            stageClearTimeLabel.font = '24px "Arial"';
            stageClearTimeLabel.text = "STAGE" + (i+1) +"："+ stageClearTimeArray[i];
            scene.addChild(stageClearTimeLabel);  //ステージクリア合計タイム
          }
        }
        scene.addChild(button);       //タイトルに戻るボタンを表示
        scene.addChild(nextButton);   //次のステージに進むボタンを表示

      });
      //タイトル画面に戻るボタンを押した時のアクション
      button.ontouchstart = function(){
        core.gameoverNum = 0;     //ゲームオーバー合計回数をリセット
        core.playerDamgeNum = 0;  //被ダメージ合計回数をリセット
        core.replaceScene(createGameStartScene());  //タイトル画面に戻る
      }
      //次のステージに進むボタンを押した時のアクション
      nextButton.ontouchstart = function(){
        if (stageMode == 1) {
          core.replaceScene(createGameScene(stageNumber+1, 1));  //次のステージに進む
        } else {
          core.replaceScene(createGameScene(stageNumber+1, 0));  //次のステージに進む
        }

      }
      return scene;
    }

    //ゲーム全ステージクリア画面
    var createGameAllClearScene = function(player, stageLabel, stageNumber, timeLabel, stageMode){
      var scene = new Scene();
      var backGround = new Sprite(960, 540);
      backGround.image = core.assets[LOAD.IMG.BACKGROUND_IMG];
      scene.addChild(backGround);
      scene.addChild(player);
      scene.addChild(stageLabel);
      scene.addChild(timeLabel);
      for (var i = 0; i < player.life; i++) {
        scene.addChild(player.myLifeLabel[i]);
      }
      //Congratulations!の文字を表示
      var clearLabel = new Sprite(540, 100)
      clearLabel.image = core.assets[LOAD.IMG.ALLCLEAR_IMG];
      clearLabel.x = (core.width - clearLabel.width) / 2 ;
      clearLabel.y = 190;
      clearLabel.scale(1.2);
      //moyaminCの画像を表示
      var moyamins = new Sprite(80, 80);
      moyamins.image = core.assets[LOAD.IMG.BOSS_IMG];
      moyamins.frame = 3;
      moyamins.scale(1.2);
      moyamins.x = 750;
      moyamins.y = 430;
      //moyaminCのセリフを表示
      var oteage = new Label("こうさんだモーン");
      oteage.x = moyamins.x - 50;
      oteage.y = moyamins.y - 50;
      oteage.color = 'white';
      oteage.font = '24px "Arial"';
      //全部のmoyamin画像を表示
      var moyaminC = [];
      for (var i = 0; i < 5; i++) {
        moyaminC[i] = new Sprite(80, 80);
        moyaminC[i].image = core.assets[LOAD.IMG.BOSS_IMG];
        moyaminC[i].frame = i;
        moyaminC[i].x = 250 + 110 * i;
        moyaminC[i].y = 85;
      }
      //「RANK：」or「TOTAL：」の文字を表示
      var rank = new Label();
      rank.moveTo(350,430);
      rank.color = 'white';
      if (stageMode == 0) {
        rank.text = "RANK：";
      } else if(stageMode == 1){
        rank.text = "TOTAL：";
      }
      rank.font = '24px "Arial"';
      //プレイヤーランクを表示
      var rankPlayer = new Label();
      rankPlayer.moveTo(rank.x+100,410);
      rankPlayer.color = 'white';
      rankPlayer.font = '48px "Arial"';
      if (stageMode == 0) {
        var rankcount = 0;
        switch (core.gameoverNum) {
          case 0:
            if (core.playerDamgeNum == 0) {
              rankcount = 0;
              rankPlayer.color = 'gold';
              rankPlayer.text = "MASTER";
            } else if (core.playerDamgeNum < 3){
              rankcount = 1;
              rankPlayer.color = 'hotpink';
              rankPlayer.text = "SS";
            } else {
              rankcount = 2;
              rankPlayer.color = 'hotpink';
              rankPlayer.text = "S";
            }
            break;
          case 1:
            rankcount = 3;
            rankPlayer.text = "A";
            break;
          case 2:
          case 3:
            rankcount = 4;
            rankPlayer.text = "B";
            break;
          case 4:
          case 5:
            rankcount = 5;
            rankPlayer.color = 'gray';
            rankPlayer.text = "C";
            break;
          case 6:
          case 7:
            rankcount = 6;
            rankPlayer.color = 'gray';
            rankPlayer.text = "D";
            break;
          default:
            rankcount = 7;
            rankPlayer.color = 'gray';
            rankPlayer.text = "E";
            break;
        }
        //プレイヤーランクをローカルストレージに保存
        if (!localStorage.getItem("rankcount")) { //もしローカルストレージのrankcountがnullだったら100を保存
          localStorage.setItem("rankcount", "100");
        }
        //最高プレイヤーランクを更新したかどうか判別
        if (rankcount < JSON.parse(localStorage.getItem("rankcount"))) {
          localStorage.setItem("rankcount", JSON.stringify(rankcount));     //ランクカウント更新
          localStorage.setItem("rankPlayerText", rankPlayer.text);          //最高プレイヤーランクを更新
          localStorage.setItem("rankPlayerColor", rankPlayer.color);        //文字の色も更新
        }
      }
      //ゲームオーバー回数を表示
      var rankGameoverNum = new Label();
      rankGameoverNum.moveTo(350,480);
      rankGameoverNum.color = 'white';
      rankGameoverNum.text = "ゲームオーバー回数　：" + core.gameoverNum;
      rankGameoverNum.font = '12px "Arial"';
      //ダメージを受けた回数を表示
      var rankPlayerDamageNum = new Label();
      rankPlayerDamageNum.moveTo(350,500);
      rankPlayerDamageNum.color = 'white';
      rankPlayerDamageNum.text = "ダメージを受けた回数：" + core.playerDamgeNum;
      rankPlayerDamageNum.font = '12px "Arial"';

      //ゲームクリアの文字を表示
      player.tl.delay(60).then(function(){
        scene.addChild(clearLabel);
      });
      //タイトル画面に戻るボタン
      var button = new Button("Back to Title!", "dark");
      button.x = 100;
      button.y = 450;
      // ツイートボタン
      var e = new Entity();
      e._element = document.createElement('div');
      e.width = 320;
      e._element.innerHTML = "<p><a id=\"tweet\" href=\"https://twitter.com/intent/tweet?hashtags=moyaminC_taoshita&text=「RANK: "+rankPlayer.text+"」でmoyaminCを倒しました！&url=https://jugjug7531.github.io/moyaminC_taosu/\" target=\"_blank\">Tweet</a></p>"
      e.moveTo(400.440);
      e.color = 'white';
      //時間差で降参moyamiC達とボタンとプレイヤーランクを表示
      player.tl.delay(75).then(function(){
        for (var i = 0; i < 5; i++) {
          scene.addChild(moyaminC[i]);
        }
        if (stageMode == 0) {
          //通常モード
          scene.addChild(moyamins);
          scene.addChild(oteage);
          scene.addChild(rankPlayer);
          scene.addChild(rankGameoverNum);
        } else if (stageMode == 1) {
          //タイムアタックモード　ステージクリアタイム
          var totalTime = 0;
          for (var i = 0; i < stageNumber; i++) {
            //各ステージのクリアタイム
            var stageClearTimeLabel = new Label("");
            stageClearTimeLabel.moveTo(scene.width/2 +230, 340 + i * 30);
            stageClearTimeLabel.color = 'white';
            stageClearTimeLabel.font = '24px "Arial"';
            stageClearTimeLabel.text = "STAGE" + (i+1) +"："+ stageClearTimeArray[i];
            scene.addChild(stageClearTimeLabel);  //ステージクリア合計タイム
            totalTime += parseFloat(stageClearTimeArray[i]);
          }
          //ペナルティ　（ダメージ回数×10秒を加算）
          var penalty = new Label("");
          penalty.moveTo(scene.width/2 +230, 435);
          penalty.color = 'white';
          penalty.font = '16px "Arial"';
          penalty.text = "ダメージ回数×10："+ core.playerDamgeNum + "×"+ 10;
          scene.addChild(penalty);
          totalTime += parseInt(core.playerDamgeNum * 10);
          //点線
          var line = new Label("ーーーーーーーーー");
          line.moveTo(scene.width/2 +230, 450);
          line.color = 'white';
          line.font = '24px "Arial"';
          scene.addChild(line);
          //合計タイム
          var totalTimeLabel = new Label("");
          totalTimeLabel.moveTo(scene.width/2 +230, 470);
          totalTimeLabel.color = 'white';
          totalTimeLabel.font = '24px "Arial"';
          totalTimeLabel.text = "TOTAL  ：" + totalTime.toFixed(2);
          scene.addChild(totalTimeLabel);
          //合計タイムをローカルストレージに保存
          if (!localStorage.getItem("totalTime")) { //もしローカルストレージのがnullだったら999.99を保存
            localStorage.setItem("totalTime", JSON.stringify(999.99));
          }
          //合計クリアタイムを更新したかどうか判別（問題あり）
          if (totalTime.toFixed(2) < parseFloat(JSON.parse(localStorage.getItem("totalTime"))) ) {
            localStorage.setItem("totalTime", JSON.stringify(totalTime.toFixed(2)));     //合計クリアタイム更新
            rankPlayer.color = 'gold';
          }
          //プレイヤーランクの場所に合計クリアタイムを表示
          rankPlayer.text = totalTime.toFixed(2);
          scene.addChild(rankPlayer);
          //ツイート内容の変更
          e._element.innerHTML = "<p><a id=\"tweet\" href=\"https://twitter.com/intent/tweet?hashtags=moyaminC_taoshita&text=「TOTAL TIME: "+rankPlayer.text+"」ですべてのmoyaminCを倒しました！&url=https://jugjug7531.github.io/moyaminC_taosu/\" target=\"_blank\">Tweet</a></p>"
        }
        scene.addChild(rank);
        scene.addChild(rankPlayerDamageNum);
        scene.addChild(button);
        scene.addChild(e);
      });
      //タイトル画面に戻るボタンを押した時のアクション
      button.ontouchstart = function(){
        core.gameoverNum = 0;     //ゲームオーバー合計回数をリセット
        core.playerDamgeNum = 0;  //被ダメージ合計回数をリセット
        core.replaceScene(createGameStartScene());  //タイトル画面に戻る
      }
      return scene;
    }

    //スタート画面
    var createGameStartScene = require("./scenes/start.js")(core)

    //BGM&SE音量調節ができるシーンを表示する関数

    sceneList.addScene("gameScene", createGameScene);
    sceneList.addScene("pause", createGamePauseScene);
    sceneList.addScene("gameover", createGameOverScene);
    sceneList.addScene("gameclear", createGameClearScene);
    sceneList.addScene("allclear", createGameAllClearScene);
    sceneList.addScene("start", createGameStartScene);

    //0からnまでの乱数を生成する関数
    function rand(n) {
      return Math.floor(Math.random() * (n+1));
    }
    // core.replaceScene(createGameStartScene());
    core.replaceScene(sceneList.getScene("start")());
    //core.replaceScene(createGameScene(3)); //バグ修正用
  }
  core.start();
};
