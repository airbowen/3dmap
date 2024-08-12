export type ResponseType = {
    success: boolean;
    msg: string;
    data?: any
}

export const theSuccess = (data?: any | null, msg?: string): ResponseType => {
    return {
        success: true,
        msg: msg || '',
        data
    }
}
export const theError = (msg?: string): ResponseType => {
    return {
        success: false,
        msg: msg || '',
        data: null
    }
}

/**
 * 
 * @param url 请求地址
 * @param method 请求方式
 * @param headers 请求头
 * @param params 请求参数
 * @param query 路径参数
 * @returns 
 */
export const fetchQuery = (url: string, method: "POST" | "GET",headers={}, params={},query={}):Promise<any> => {
    const queryString = new URLSearchParams(query).toString(); 
    console.log('queryString',queryString);
    
    return new Promise((resolve, reject) => {
        fetch(`${url}${queryString?('?'+queryString):''}`, {
            method: method || 'POST', // 请求方法  
            headers:{
                ...headers,
                'Accept': 'text/event-stream'
            },
            body: JSON.stringify(params || {}), // 将我们的数据转换为JSON字符串  
        }).finally(()=>{
            console.log(123);
            
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
              }
              return response.text(); // 获取响应文本
        })
        .then(eventStreamData => {
            // 在这里解析 eventStreamData，处理事件流
            console.log('eventStreamData',eventStreamData);
            
          })
        // .then(body => {
        //     console.log(body); // 处理从服务器返回的数据  
            
        //     const parsedData = parseSSEMessage(body);  
        //     console.log(parsedData);
        //     let arr = body.split('data:');
        //     console.log('arr',arr);
            
        //     resolve(body)
        // })
        .catch(error => {
            reject(error)
            console.error('There was a problem with your fetch operation:', error);
        });
    })
}

function parseSSEMessage(message) {  
    // 假设message是从SSE连接中接收到的整行数据  
    // 例如: "event:conversation.chat.completed\ndata:{\"id\":\"7394816695363256330\",...}"  
    
    // 首先，按换行符分割字符串，得到事件名和数据部分  
    const parts = message.trim().split('\n');  
    
    // 遍历分割后的数组，找到data部分  
    let dataPart = null;  
    parts.forEach(part => {  
      const [key, value] = part.split(':');  
      if (key.trim() === 'data') {  
        // 去除值前面的空格，并处理JSON转义字符（如果必要的话）  
        // 注意：这里假设数据已经是有效的JSON字符串，但可能包含转义字符  
        dataPart = value.trim().replace(/\\/g, ''); // 这一步可能是不必要的，取决于数据的实际格式  
        // 如果数据中包含转义的JSON字符串（如JSON字符串内部的双引号被转义），你可能需要使用更复杂的逻辑来解析  
      }  
    });  
    
    // 解析JSON数据  
    if (dataPart) {  
      try {  
        const data = JSON.parse(dataPart);  
        // 现在你可以使用data对象了  
        console.log(data);  
        return data;  
      } catch (error) {  
        console.error('Failed to parse JSON:', error);  
      }  
    }  
    
    // 如果没有找到data部分或解析失败，返回null或适当的错误消息  
    return null;  
  }  
    