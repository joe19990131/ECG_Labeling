import axios from 'axios'
import { ref } from 'vue'

export async function useAxios(url, method, headers, data) {
  const responseData = ref(null)
  const error = ref(null)
  await axios({
    method: method,
    headers: headers,
    url: url,
    data: data
  })
    .then((res) => {
      responseData.value = res
    })
    .catch((error) => (error.value = error))

  return responseData, error
}
