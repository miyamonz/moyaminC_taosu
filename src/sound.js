const LOAD = require("./loadFiles.js")

let stages = [
  LOAD.BGM.STAGE1_BGM,
  LOAD.BGM.STAGE2_BGM,
  LOAD.BGM.STAGE3_BGM,
];
let stageDefaultVolume = [ 0.07,0.13,0.13 ];
let ses = [
  LOAD.SE.PLAYER_DAMAGE_SE,
  LOAD.SE.PLAYER_DEAD_SE,
  LOAD.SE.BOSS_DAMAGE_SE,
  LOAD.SE.BOSS_DEAD_SE,
]
let seDefaultVolume = [ 0.12, 0.8, 0.03, 0.04 ];

module.exports = function(core) {
  return {
    currentScene: 1,
    getCurrentSound:function () {
      if(1 > this.currentScene || this.currentScene > 3) return;
      return core.assets[stages[this.currentScene-1]];
    },
    bgmPlay: function(bool) {
      let se = this.getCurrentSound();
      if(bool === true) se.play();
      else if(bool === false) se.stop();
      else if(bool === "play") se.play();
      else if(bool === "stop") se.stop();
      else if(bool === "pause") se.pause();
    },
    initVolume: function() {
      let sounds = [
        LOAD.SE.PLAYER_DAMAGE_SE,
        LOAD.SE.PLAYER_DEAD_SE,
        LOAD.SE.BOSS_DAMAGE_SE,
        LOAD.SE.BOSS_DEAD_SE,
        LOAD.BGM.STAGE1_BGM,
        LOAD.BGM.STAGE2_BGM,
        LOAD.BGM.STAGE3_BGM,
      ];
      let volume = [
        0.12,
        0.8,
        0.03,
        0.04,
        0.07,
        0.13,
        0.13,
      ];
      sounds.forEach( (file,i) => {
        let se = core.assets[file];
        se.volume = volume[i];
      })
    },
    initialize: function(){
      let se = [
        this.playerDamageSe,
        this.playerDeadSe,
        this.bossDamageSe,
        this.bossDeadSe,
        this.stage1Bgm,
        this.stage2Bgm,
        this.stage3Bgm,
      ];

      se.forEach( s => {
        s(1);
        s.volume = s(2)
        this.reset(s(0))
      } )
    },
    reset: function (TARGET) {
      TARGET.pause();
      TARGET.currentTime = 0;
    },
    // プレイヤーがダメージを受けた時のSE
    playerDamageSe: function(play) {  //0でそのものを返す 1で再生 2で音量初期化
      var se = core.assets[LOAD.SE.PLAYER_DAMAGE_SE];
      if (play == 1) {
        se.play();     //Se再生
      } else if (play == 2) {
        return 0.12;
      }
      return se;
    },
    playerDeadSe: function(play) {  //1で再生 2で音量初期化
      var se = core.assets[LOAD.SE.PLAYER_DEAD_SE];
      if (play == 1) {
        se.play();     //Se再生
      } else if (play == 2) {
        return 0.8;
      }
      return se; //0.8
    },
    //ボスがダメージを受けた時のSE
    bossDamageSe: function(play) {  //1で再生 2で音量初期化
      var se = core.assets[LOAD.SE.BOSS_DAMAGE_SE];
      if (play == 1) {
        se.play();     //Se再生
      } else if (play == 2) {
        return 0.03;
      }
      return se; //0.03
    },
    bossDeadSe: function(play) {  //1で再生 2で音量初期化
      var se = core.assets[LOAD.SE.BOSS_DEAD_SE];
      if (play == 1) {
        se.play();     //Se再生
      } else if (play == 2) {
        return 0.04;
      }
      return se; //0.04
    },
    stage1Bgm: function(play) { //1で再生 2で音量初期化
      var stageBgm = core.assets[LOAD.BGM.STAGE1_BGM];
      if (play == 1) {
        stageBgm.play();
      } else if (play == 2){
        return 0.07;  //音量初期値
      }
      return stageBgm;
    },
    stage2Bgm: function(play) { //1で再生 2で音量初期化
      var stageBgm = core.assets[LOAD.BGM.STAGE2_BGM];
      if (play == 1) {
        stageBgm.play();
      } else if (play == 2){
        return 0.13;  //音量初期値
      }
      return stageBgm;
    },
    stage3Bgm: function(play) { //1で再生 2で音量初期化
      var stageBgm = core.assets[LOAD.BGM.STAGE3_BGM];
      if (play == 1) {
        stageBgm.play();
      } else if (play == 2){
        return 0.13;  //音量初期値
      }
      return stageBgm;
    },
    bgmLength : function(num) { //BGMの長さ(5の倍数で切り上げ)
      switch (num) {
        case 1: return 100; //100
          break;
        case 2: return 103; //103
          break;
        case 3: return 150; //150
          break;
        default:

      }
    },
    bgmVolume: 10,
    seVolume: 10,
    addVolumeBGM: function(diff = 0){
      if(diff !== Math.round(diff)) return
      let newVol = this.bgmVolume + diff;
      if( 0 <= newVol && newVol <= 20 ) this.bgmVolume = newVol;
    },
    addVolumeSE: function(diff){
      if(diff !== Math.round(diff)) return
      let newVol = this.seVolume + diff;
      if( 0 <= newVol && newVol <= 20 ) this.seVolume = newVol;

    },
    applyVolumes: function() {
      stages.forEach( (file,i) => {
        let s = core.assets[file];
        s.volume = stageDefaultVolume[i] * this.bgmVolume/10;
      });
      ses.forEach( (file, i) => {
        let s = core.assets[file];
        s.volume = seDefaultVolume[i] * this.seVolume/10;
      } )
    },

    
    volumeChange: function(change, nowVolume, initVolume){  //change: 0が初期化 １で音量アップ ２で音量ダウン
      switch (change) {
        case 1:
          var volume = nowVolume;
          volume = Math.round((volume + initVolume/10) * 1000)/1000;
          return volume;
          break;
        case 2:
          var volume = nowVolume;
          volume = Math.round((volume - initVolume/10) * 1000)/1000;
          return volume;
          break;
      }
    }
  };
}
