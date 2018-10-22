class P extends Promise {
  static parallelOnce(items) {
    return new Promise((resolve, reject) => {
      const tasks = items.map(item => {
        // 当前任务状态
        const task = {
          status: 'pending',
          value: undefined
        }

        item()
          .then(val => {
            task.status = 'resolved'
            task.value = val
            resolve(task.value)
          })
          .catch(err => {
            task.status = 'rejected'
            task.value = err
            let isHasPendingTask = false

            // 检测是否已经
            for (let i = 0, length = tasks.length; i < length; i++) {
              if (tasks[i].status === 'resolved') return
              if (tasks[i].status === 'pending') {
                isHasPendingTask = true
                break
              }
            }

            // 所有都失败则，任务失败
            if (!isHasPendingTask) reject(new Error('ALL_REJECTED'))
          })
        return task
      })
    })
  }
  static serialOnce(items) {
    return new Promise((resolve, reject) => {
      let i = 0
      async function next() {
        const slice = items.slice(i, ++i)[0]
        // 如果数据执行完之后还没有成功就认定失败
        if (!slice) return reject(new Error('ALL_REJECTED'))
        try {
          // 执行处理逻辑
          resolve(await slice())
        } catch (e) {
          // 循环下一个切片
          await next()
        }
      }
      next()
    })
  }
}
