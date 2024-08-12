import { useAsyncEffect, useSetState } from 'ahooks';
import styles from './style.less'
import { useContext, useEffect, useRef, useState } from 'react';
import { Button, Input } from 'antd';
interface IProps {
    answerText?: string;
    botAnswer?: string;
}
const Bot = (props: IProps) => {
    const answerText = props?.answerText
    useEffect(() => {
        
        setInputValue(answerText || '')
        answerText && getBotAnswer(answerText)
    }, [answerText])
    let [state, setState] = useState<{ waitting?: boolean, loading?: boolean, done?: boolean }>({
        waitting: false,
        loading: false,
        done: true
    })


    const [botInfo] = useSetState<{ conversation_id: string, botId: string }>({
        conversation_id: "73635987399797964801",
        botId: "7394790869385297930",
    })

    const xhrRef = useRef<any>()
    const getBotAnswer = (name?: string) => {
        console.log('getBotAnswer', name);

        setBotValue('')
        setState({
            waitting: true,
            loading: true,
            done: false
        })
        let str = ''
        const url = 'https://api.coze.cn/v3/chat';
        xhrRef.current = new XMLHttpRequest()
        const xhr = xhrRef.current;

        xhr.open("POST", url)
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.setRequestHeader("Authorization", 'Bearer pat_lUacIqEfMlf6skVsQnHd69MQKoa5a8FA2WCLwhLtiTvsBVjQTy5bgJlChhEq1MbE');
        xhr.onprogress = (event: any) => {
            const response = event.target.response as string
            if (response.indexOf('event:conversation.message.completed') !== -1) {
                const arr = response.split('data:');
                const lastMessage = arr[arr.length - 1]
                if (lastMessage) {
                    try {

                        const json = JSON.parse(lastMessage)

                        if (json.type === 'answer') {
                            str = json?.content
                        } else if (json.type === 'verbose') {
                            console.log('verbose', json);
                        }

                        if (json === '[DONE]') {
                            console.log('结束');
                            console.log(str);
                            setBotValue(str)
                            str = ''
                            setState({
                                waitting: false,
                                loading: false,
                                done: true
                            })
                        }
                    } catch (error) {

                    }
                }

            }


        }

        const value = name || inputValue
        let data = JSON.stringify({
            bot_id: botInfo.botId,
            user_id: botInfo.conversation_id,
            "stream": true,
            "auto_save_history": true,
            "additional_messages": [
                {
                    "role": "user",
                    "content": value ? value + '200字内' : "介绍一下闲林埠 200字内",
                    "content_type": "text"

                }
            ]
        })
        xhrRef.current.send(data)
    }

    useEffect(() => {
        getBotAnswer();
    }, [])

    const BotChat = () => {
        if (state?.done) {

        }

        getBotAnswer()
    }

    const [inputValue, setInputValue] = useState<string>('')
    const [botValue, setBotValue] = useState<string>('')


    return <div className={styles.bot}>
        <div className={styles.handle}>
            <Button loading={state.loading} onClick={BotChat}>查询</Button>
        </div>

        <div className={styles.botContent}>
            <Input onChange={(e: any) => setInputValue(e.target.value)} placeholder={`请输入问题或者地点`} value={inputValue} type="text" />
            {botValue}
        </div>
    </div>
}
export default Bot