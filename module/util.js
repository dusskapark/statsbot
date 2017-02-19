/**
 * 끝에 :8080이 붙은, node가 받아서 처리하는 URL을 리턴
 * 
 */
function url_node(path) {
  return `http://${process.env.C9_HOSTNAME}:${process.env.C9_PORT}${path}`;
}

/**
 * 아파치가 처리하는 https URL을 리턴
 * 
 */
function url_https(path) {
  return `https://${process.env.C9_HOSTNAME}${path}`;
}

module.exports = {
  url_node : url_node,
  url_https: url_https
}
