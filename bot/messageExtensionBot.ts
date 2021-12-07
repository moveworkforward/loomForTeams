import { default as axios } from "axios";
import { TeamsActivityHandler, CardFactory, TurnContext} from "botbuilder";

const staticBaseUrl = 'https://black-river-0bcb7c503.azurestaticapps.net';

const TaskModuleIds = {
  Loom: 'Loom'
};

const TaskModuleUIConstants = {
  Loom: {
    width: 1000,
    height: 700,
    title: 'Loom video',
    id: TaskModuleIds.Loom,
    buttonTitle: 'Loom',
  }
};

export class MessageExtensionBot extends TeamsActivityHandler {

  public async handleTeamsMessagingExtensionSubmitAction(
    context: TurnContext,
    action: any
  ): Promise<any> {
    switch (action.commandId) {
      case "createCard":
        return createCardCommand(context, action);
      default:
        throw new Error("NotImplemented");
    }
  }

  public setTaskInfo(taskInfo, uiSettings) {
    taskInfo.height = uiSettings.height;
    taskInfo.width = uiSettings.width;
    taskInfo.title = uiSettings.title;
  }

  public async handleTeamsTaskModuleFetch(context: TurnContext, taskModuleRequest): Promise<any> {
    
    const cardTaskFetchValue = taskModuleRequest.data.data;
    var taskInfo = {} as any;
    
    if (cardTaskFetchValue.type === TaskModuleIds.Loom) {
      taskInfo.url = taskInfo.fallbackUrl = `${staticBaseUrl}/?sharedUrl=${cardTaskFetchValue.sharedUrl}`;
      this.setTaskInfo(taskInfo, TaskModuleUIConstants.Loom);
    }

    return {
      task: {
        type: 'continue',
        value: taskInfo
      }
    };
  }

  // public async handleTeamsAppBasedLinkQuery(context: TurnContext, data: any): Promise<any> {
  //   const response = await createCardCommand(context, { data });
  //   console.log(response);
  //   return Promise.resolve(response);
  // }
}

async function createCardCommand(context: TurnContext, action: any): Promise<any> {
  const data = action.data;
  let response;
  try {
    response = await axios.get(
      `https://www.loom.com/v1/oembed?url=${data.url}`
    );
  } catch (error) {
    console.log(error);
  }
  
  const { thumbnail_url, duration, title, description, html } = response.data;
  const playerUrl = html.match(/"(http[s]:([A-Za-z0-9_\/\.\\]+))"/i);
  const sharedUrl = encodeURI(data.url.split("?")[0]);

  console.log('TEST ->> ', playerUrl[1]);

  const attachment = CardFactory.adaptiveCard({
    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
    "type": "AdaptiveCard",
    "version": "1.0",
    "body": [
      {
        "type": "Container",
        "items": [
          {
            "type": "TextBlock",
            "text": title,
            "weight": "bolder",
            "size": "medium"
          },
        ]
      },
      {
        "type": "Container",
        "items": [
          {
            "type": "Image",
            "url": thumbnail_url,
            "altText": title,
            "size": "auto"
          },
          {
            "type": "TextBlock",
            "text": description,
            "size": "small",
            "wrap": true,
            "maxLines": 3
          },
          {
            "type": "FactSet",
            "facts": [
              {
                "title": "Duration:",
                "value": `${duration}s`
              },
            ]
          }
        ]
      }
    ],
    "actions": [
      {
        "type": "Action.OpenUrl",
        "title": "Play",
        "url": `https://teams.microsoft.com/l/task/e5416f2a-d41e-4f9a-bb00-879f81d0b2c8?url=${encodeURI(playerUrl[1])}&height=large&width=large&title=${title}`
      },
      {
        "type": "Action.OpenUrl",
        "title": "Play proxy link",
        "url": `https://teams.microsoft.com/l/task/e5416f2a-d41e-4f9a-bb00-879f81d0b2c8?url=${encodeURI(sharedUrl)}&height=large&width=large&title=${title}`
      },
      {
        "type": "Action.Submit",
        "title": "Play proxy",
        "data": { msteams: { type: 'task/fetch' }, data: { type: TaskModuleIds.Loom, sharedUrl } }
      },
      {
        "type": "Action.OpenUrl",
        "title": "Watch on Loom",
        "url": data.url
      }
    ]
  }
  );

  return {
    composeExtension: {
      type: "result",
      attachmentLayout: "list",
      attachments: [{...attachment, preview: attachment}],
    },

  };
}
