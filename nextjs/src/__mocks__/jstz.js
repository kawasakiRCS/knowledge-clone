// jstzライブラリのモック
module.exports = {
  determine: function() {
    return {
      name: function() {
        return 'Asia/Tokyo';
      }
    };
  }
};