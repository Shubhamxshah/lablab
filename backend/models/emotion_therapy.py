# import os
# from dotenv import load_dotenv
#
# from langchain_openai import ChatOpenAI
# from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
#
# load_dotenv()
#
# base_url = 'https://api.rhymes.ai/v1'
# api_key = os.getenv("ARIA_API_KEY")
#
# client: ChatOpenAI = ChatOpenAI(
#     model="aria",
#     base_url=base_url,
#     api_key=api_key,
#     streaming=True
# )
#
# def emotion_therapy(memory: str):
#     """
#     Recieves a memory from user, which is processed by AI and provide emotional therapy to the user
#
#     Arguments:
#         memory (str): The memory from the user
#
#     Return:
#         ai_response (str): A emotional therapy response to the user from AI
#
#     """
#
#     response = client.stream([
#         SystemMessage(content=f"""You are an empathetic AI therapist designed to help users process heal from emotional memories. You will be provide a memory {memory} and your goal is to provide compassionate support, validate the  user's feelings, and offer therapeutic insights based on the emotions conveyed. First, identify the core emotion (e.g., sadness, anger, joy), then reflect back with empathy, validating the user’s experience. Provide tailored therapeutic , such as cognitive reframing, mindfulness, self-compassion, or closure techniques, to help the user emotionally heal. Encourage positive actions and self-care, while maintaining a respectful, non-judgmental, and sensitive approach to foster growth and resilience, always ensuring the user feels safe and understood."""),
#         HumanMessage(content=memory)
#     ])
#
#     for chunk in response:
#         if chunk.content is not None:
#             yield chunk.content

# import os
# import logging
# from dotenv import load_dotenv
#
# from openai import OpenAI
# from openai.types.chat import ChatCompletion
#
#
# load_dotenv()
#
# api_key = os.getenv('API_KEY')
#
# client: OpenAI = OpenAI(
#     api_key=api_key,
#     base_url='https://api.aimlapi.com/'
# )
#
# def emotion_therapy(memory: str) -> str:
#     """
#     Recieves a memory from user, which is processed by AI and provide emotional therapy to the user
#
#     Arguments:
#         memory (str): The memory from the user
#
#     Return:
#         ai_response (str): A emotional therapy response to the user from AI
#
#     """
#
#     response: ChatCompletion = client.chat.completions.create(
#     model ="meta-llama/Llama-3.2-3B-Instruct-Turbo",
#     messages=[
#             {
#                 "role": "system", 
#                 "content": f"""You are an empathetic AI therapist designed to help users process and heal from 
#                             emotional memories. You will be provide a memory {memory} and your goal is to provide 
#                             compassionate support, validate the  user's feelings, and offer therapeutic insights based on the emotions conveyed. 
#                             First, identify the core emotion (e.g., sadness, anger, joy), then reflect back 
#                             with empathy, validating the user’s experience. Provide tailored therapeutic 
#                             advice, such as cognitive reframing, mindfulness, self-compassion, or closure 
#                             techniques, to help the user emotionally heal. Encourage positive actions and 
#                             self-care, while maintaining a respectful, non-judgmental, and sensitive approach 
#                             to foster growth and resilience, always ensuring the user feels safe and understood."""
#             },
#             {
#                 "role": "user", 
#                 "content": memory
#             }
#         ]   
#     )
#
#     ai_response: str = response.choices[0].message.content
#     return ai_response

import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from typing_extensions import TypedDict
from langgraph.checkpoint.memory import MemorySaver
from typing import Annotated
from langgraph.graph.message import add_messages
from langgraph.graph import StateGraph, START, END
from langchain.schema import AIMessage
load_dotenv()

class State(TypedDict): 
    messages: Annotated[list, add_messages]
llm_model = ChatGroq(
    model="llama-3.2-1b-preview",
    verbose=True,
    temperature=0.5,
    api_key=os.getenv("GROQ_API_KEY")
)

def chatbot(state: State):
    return {"messages": [llm_model.invoke(state["messages"])]}


memory = MemorySaver()

def therapy_agent():
  graph_builder = StateGraph(State)

  graph_builder.add_node("chatbot", chatbot)

  graph_builder.add_edge(START, "chatbot")
  graph_builder.add_edge("chatbot", END)

  graph = graph_builder.compile(checkpointer=memory)
  return graph

def emotion_therapy(memory: str):
  graph = therapy_agent()
  messages = []
  config = {"configurable": {"thread_id": "1556"}}
  events = graph.stream(
      {"messages": [("user", memory)]},  # Changed here
      config=config,
      stream_mode="values"
  )
  for event in events:
      messages.extend(event['messages'])  # Collect each event message

  # Filter for the last AIMessage in the accumulated messages
  ai_messages = [msg for msg in messages if isinstance(msg, AIMessage)]
  return ai_messages[-1].content if ai_messages else None  # Return the last AI message if available
